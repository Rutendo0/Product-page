 import type { Express, Request, Response } from "express";
 import { storage, type Order, type InsertProduct } from "./storage";
 import { type SellerProfile, type InsertSellerProfile } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import { createClerkClient, verifyToken } from "@clerk/backend";
interface AuthRequest extends Request {
  userId?: number;
  clerkUserId?: string;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Authorization header required" });
  }

  const token = authHeader.substring(7);
  if (!process.env.CLERK_SECRET_KEY) {
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const claims = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const email = claims.email as string;
    let localUser = await storage.getUserByEmail(email);
    if (!localUser) {
      localUser = await storage.createUser({
        username: (claims.username as string) || email.split('@')[0],
        email,
        password: `clerk_${claims.sub}`,
      });
    }
    req.userId = localUser.id;
    req.clerkUserId = claims.sub as string;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export async function registerRoutes(app: Express): Promise<void> {
  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // Verify email address from Clerk
  app.get("/register/verify-email-address", async (req: Request, res: Response) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.redirect(`${frontendUrl}/login?error=invalid_token`);
      }

      res.redirect(`${frontendUrl}/verify-email?token=${token}`);
    } catch (error: any) {
      console.error("Email verification error:", error);
      res.redirect(`${frontendUrl}/login?error=email_verification_failed`);
    }
  });

  // Register user
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existingByUsername = await storage.getUserByUsername(username);
      if (existingByUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }

      const existingByEmail = await storage.getUserByEmail(email);
      if (existingByEmail) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
      });

      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Login user
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { usernameOrEmail, password } = req.body;
      if (!usernameOrEmail || !password) {
        return res.status(400).json({ message: "Username/email and password required" });
      }

      let user: any;
      if (usernameOrEmail.includes('@')) {
        user = await storage.getUserByEmail(usernameOrEmail);
      } else {
        user = await storage.getUserByUsername(usernameOrEmail);
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "Server configuration error" });
      }

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      await storage.createSession({
        userId: user.id,
        token,
        expiresAt,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Logout user
  app.post("/api/logout", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Authorization header required" });
      }

      const token = authHeader.substring(7);
      const session = await storage.getSessionByToken(token);
      if (!session) {
        return res.status(401).json({ message: "Invalid token" });
      }

      await storage.deleteSessionByToken(token);
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  // Get all products with optional filtering
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const queryParams = req.query;
      const filter: any = {};

      if (queryParams.categories) {
        filter.categories = Array.isArray(queryParams.categories)
          ? (queryParams.categories as string[])
          : [queryParams.categories as string];
      }

      if (queryParams.brands) {
        filter.brands = Array.isArray(queryParams.brands)
          ? (queryParams.brands as string[])
          : [queryParams.brands as string];
      }

      if (queryParams.search) {
        filter.search = queryParams.search as string;
      }

      if (queryParams.minPrice) filter.minPrice = parseFloat(queryParams.minPrice as string);
      if (queryParams.maxPrice) filter.maxPrice = parseFloat(queryParams.maxPrice as string);
      if (queryParams.sort) filter.sort = queryParams.sort as string;
      if (queryParams.page) filter.page = parseInt(queryParams.page as string, 10);
      if (queryParams.limit) filter.limit = parseInt(queryParams.limit as string, 10);

      // Optional: compatibility filters
      if (queryParams.make || queryParams.model || queryParams.year) {
        (filter as any).compatibility = {
          make: queryParams.make as string | undefined,
          model: queryParams.model as string | undefined,
          year: queryParams.year as string | undefined,
        };
      }

      // Supplier filters
      if (queryParams.suppliers) {
        (filter as any).suppliers = Array.isArray(queryParams.suppliers)
          ? (queryParams.suppliers as string[])
          : [queryParams.suppliers as string];
      }

      const result = await storage.getProducts(filter);
      res.json(result);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get a single product by ID
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const productId = req.params.id;
      const product = await storage.getProduct(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Get all product categories
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getProductCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get all product brands
  app.get("/api/brands", async (_req: Request, res: Response) => {
    try {
      const brands = await storage.getProductBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  // Upgrade to seller using Clerk token (frontend uses Clerk getToken())
  app.post("/api/upgrade-to-seller", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization header required" });
      }
      const token = authHeader.substring(7);

      if (!process.env.CLERK_SECRET_KEY) {
        return res.status(500).json({ message: "Clerk configuration error" });
      }

      // Verify the Clerk-issued token
      const verified = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      const clerkUserId = verified.sub; // Clerk user ID (string like 'user_...')
      if (!clerkUserId) {
        return res.status(401).json({ message: "Invalid token payload" });
      }

      const { businessName, businessDescription } = req.body || {};

      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      await clerk.users.updateUser(clerkUserId, {
        publicMetadata: {
          isSeller: true,
          businessName: businessName || null,
          businessDescription: businessDescription || null,
        },
      });

      return res.json({ ok: true });
    } catch (error: any) {
      console.error("Error upgrading to seller:", error);
      return res.status(500).json({ message: "Failed to upgrade account" });
    }
  });

  // Get min and max product prices
  app.get("/api/price-range", async (_req: Request, res: Response) => {
    try {
      const priceRange = await storage.getMinMaxPrices();
      res.json(priceRange);
    } catch (error) {
      console.error("Error fetching price range:", error);
      res.status(500).json({ message: "Failed to fetch price range" });
    }
  });

  // Create order (authenticated)
  app.post("/api/orders", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const body = req.body;
      // Basic validation
      if (!body || !Array.isArray(body.items) || body.items.length === 0) {
        return res.status(400).json({ message: "Items are required" });
      }
      if (!body.fullName || !body.phone || !body.email) {
        return res.status(400).json({ message: "Full name, phone and email are required" });
      }
      if (body.deliver && !body.location) {
        return res.status(400).json({ message: "Delivery location is required when deliver=true" });
      }

      const created = await storage.createOrder({
        items: body.items,
        subtotal: body.subtotal,
        paymentMethod: body.paymentMethod,
        deliver: body.deliver,
        location: body.location,
        fullName: body.fullName,
        phone: body.phone,
        email: body.email,
        notes: body.notes,
        userId: req.userId,
      });

      res.status(201).json(created);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // List user orders (authenticated)
  app.get("/api/orders", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const orders = await storage.listUserOrders(req.userId);
      res.json(orders);
    } catch (error) {
      console.error("Error listing orders:", error);
      res.status(500).json({ message: "Failed to list orders" });
    }
  });

  // Create Stripe payment intent
  app.post("/api/create-payment-intent", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { amount } = req.body;
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ message: "Stripe configuration error" });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  // Upgrade existing account to seller
  app.post("/api/upgrade-to-seller", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { businessName, businessDescription } = req.body;
      if (!businessName || !businessDescription) {
        return res.status(400).json({ message: "Business name and description are required" });
      }

      const clerkUserId = req.clerkUserId;
      if (!clerkUserId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!process.env.CLERK_SECRET_KEY) {
        return res.status(500).json({ message: "Server configuration error" });
      }

      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      await clerk.users.updateUserMetadata(clerkUserId, {
        publicMetadata: {
          isSeller: true,
          businessName,
          businessDescription,
        },
      });

      res.json({ message: "Successfully upgraded to seller account" });
    } catch (error: any) {
      console.error("Upgrade to seller error:", error);
      res.status(500).json({ message: "Failed to upgrade account" });
    }
  });

  // Get seller dashboard data (protected: only for authenticated sellers)
  app.get("/api/seller/dashboard", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId || !req.clerkUserId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!process.env.CLERK_SECRET_KEY) {
        return res.status(500).json({ message: "Server configuration error" });
      }

      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      const clerkUser = await clerk.users.getUser(req.clerkUserId);
      const isSeller = Boolean(clerkUser.publicMetadata.isSeller);

      if (!isSeller) {
        return res.status(403).json({ message: "Seller access required. Please upgrade your account." });
      }

      const stats = await storage.getSellerStats(req.userId);

      const dashboardData = {
        stats: {
          totalSales: stats.totalSales,
          pendingOrders: stats.pendingOrders,
          activeProducts: stats.activeProducts,
          monthlyRevenue: stats.monthlyRevenue,
        },
        recentOrders: stats.recentOrders.map((order: Order) => ({
          id: order.id,
          total: order.subtotal,
          status: order.status,
          createdAt: order.createdAt.toISOString(),
          items: order.items,
        })),
      };

      res.json(dashboardData);
    } catch (error: any) {
      console.error("Error fetching seller dashboard:", error);
      res.status(500).json({ error: true });
    }
  });
  // Seller products endpoints
  app.get("/api/seller/products", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId || !req.clerkUserId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      const clerkUser = await clerk.users.getUser(req.clerkUserId);
      const isSeller = Boolean(clerkUser.publicMetadata.isSeller);

      if (!isSeller) {
        return res.status(403).json({ message: "Seller access required" });
      }

      const products = await storage.getSellerProducts(req.userId);
      res.json(products);
    } catch (error: any) {
      console.error("Error fetching seller products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/seller/products", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId || !req.clerkUserId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      const clerkUser = await clerk.users.getUser(req.clerkUserId);
      const isSeller = Boolean(clerkUser.publicMetadata.isSeller);

      if (!isSeller) {
        return res.status(403).json({ message: "Seller access required" });
      }

      const { name, description, price, image, category, brand, stock, sku } = req.body;
      if (!name || !description || !price || !image) {
        return res.status(400).json({ message: "Name, description, price, and image are required" });
      }

      const productData: InsertProduct = {
        name,
        description,
        price,
        image,
        category,
        brand,
        stock,
        sku,
        sellerId: req.userId,
        productId: `seller-prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      const created = await storage.createProduct(productData);
      res.status(201).json(created);
    } catch (error: any) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/seller/products/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId || !req.clerkUserId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      const clerkUser = await clerk.users.getUser(req.clerkUserId);
      const isSeller = Boolean(clerkUser.publicMetadata.isSeller);

      if (!isSeller) {
        return res.status(403).json({ message: "Seller access required" });
      }

      const productId = req.params.id;
      const product = await storage.getProduct(productId);
      if (!product || product.sellerId !== req.userId) {
        return res.status(404).json({ message: "Product not found or not owned by you" });
      }

      const { name, description, price, image, category, brand, stock, sku } = req.body;
      const updatedData: Partial<InsertProduct> = {
        name,
        description,
        price,
        image,
        category,
        brand,
        stock,
        sku,
      };

      const updated = await storage.createProduct({ ...product, ...updatedData, productId: product.productId });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/seller/products/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId || !req.clerkUserId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      const clerkUser = await clerk.users.getUser(req.clerkUserId);
      const isSeller = Boolean(clerkUser.publicMetadata.isSeller);

      if (!isSeller) {
        return res.status(403).json({ message: "Seller access required" });
      }

      const productId = req.params.id;
      const product = await storage.getProduct(productId);
      if (!product || product.sellerId !== req.userId) {
        return res.status(404).json({ message: "Product not found or not owned by you" });
      }

      // For in-memory, just remove from maps
      storage['products'].delete(productId);
      const sellerMap = storage['sellerProducts'].get(req.userId);
      if (sellerMap) {
        sellerMap.delete(productId);
      }

      res.json({ message: "Product deleted" });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Seller orders endpoint
  app.get("/api/seller/orders", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId || !req.clerkUserId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      const clerkUser = await clerk.users.getUser(req.clerkUserId);
      const isSeller = Boolean(clerkUser.publicMetadata.isSeller);

      if (!isSeller) {
        return res.status(403).json({ message: "Seller access required" });
      }

      const stats = await storage.getSellerStats(req.userId);
      res.json(stats.recentOrders);
    } catch (error: any) {
      console.error("Error fetching seller orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Seller purchases endpoint (seller's incoming orders mapped as purchases)
  app.get("/api/seller/purchases", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId || !req.clerkUserId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      const clerkUser = await clerk.users.getUser(req.clerkUserId);
      const isSeller = Boolean(clerkUser.publicMetadata.isSeller);

      if (!isSeller) {
        return res.status(403).json({ message: "Seller access required" });
      }

      const orders = await storage.listUserOrders(req.userId);
      const purchases = orders.map((order) => ({
        id: order.id,
        supplier: order.fullName || order.email,
        createdAt: order.createdAt.toISOString(),
        total: order.subtotal,
        status: order.status === 'pending' ? 'pending' :
                (order.status === 'paid' || order.status === 'shipped') ? 'received' : 'paid',
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      }));

      res.json(purchases);
    } catch (error: any) {
      console.error("Error fetching seller purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  // Seller sales endpoint
  app.get("/api/seller/sales", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId || !req.clerkUserId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      const clerkUser = await clerk.users.getUser(req.clerkUserId);
      const isSeller = Boolean(clerkUser.publicMetadata.isSeller);

      if (!isSeller) {
        return res.status(403).json({ message: "Seller access required" });
      }

      const stats = await storage.getSellerStats(req.userId);
      const sales = stats.recentOrders.map((order) => ({
        id: order.id,
        createdAt: order.createdAt.toISOString(),
        total: order.subtotal,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      }));

      res.json({
        stats: {
          totalRevenue: stats.totalSales, // totalSales is sum of subtotals
          totalSales: stats.pendingOrders + stats.activeProducts, // approximate count, or use length of all seller orders if needed
          monthlyRevenue: stats.monthlyRevenue,
        },
        sales,
      });
    } catch (error: any) {
      console.error("Error fetching seller sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  // Seller inventory endpoint
  app.get("/api/seller/inventory", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId || !req.clerkUserId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      const clerkUser = await clerk.users.getUser(req.clerkUserId);
      const isSeller = Boolean(clerkUser.publicMetadata.isSeller);

      if (!isSeller) {
        return res.status(403).json({ message: "Seller access required" });
        // Seller settings endpoints
        app.get("/api/seller/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
          try {
            if (!req.userId || !req.clerkUserId) {
              return res.status(401).json({ message: "User not authenticated" });
            }
      
            const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
            const clerkUser = await clerk.users.getUser(req.clerkUserId);
            const isSeller = Boolean(clerkUser.publicMetadata.isSeller);
      
            if (!isSeller) {
              return res.status(403).json({ message: "Seller access required" });
            }
      
            let profile = await storage.getSellerSettings(req.userId);
            if (!profile) {
              // Create default profile if none exists
              profile = await storage.updateSellerSettings(req.userId, {
                userId: req.userId,
                storeName: clerkUser.username || clerkUser.emailAddresses[0].emailAddress || '',
                bio: '',
                address: '',
                phone: '',
                bankAccount: '',
              });
            }
      
            // Omit internal fields if needed
            const { id, userId, createdAt, updatedAt, ...settings } = profile;
            res.json(settings);
          } catch (error: any) {
            console.error("Error fetching seller settings:", error);
            res.status(500).json({ message: "Failed to fetch settings" });
          }
        });
      
        app.put("/api/seller/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
          try {
            if (!req.userId || !req.clerkUserId) {
              return res.status(401).json({ message: "User not authenticated" });
            }
      
            const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
            const clerkUser = await clerk.users.getUser(req.clerkUserId);
            const isSeller = Boolean(clerkUser.publicMetadata.isSeller);
      
            if (!isSeller) {
              return res.status(403).json({ message: "Seller access required" });
            }
      
            const settings: InsertSellerProfile = req.body;
            if (!settings.storeName || !settings.address || !settings.phone) {
              return res.status(400).json({ message: "Store name, address, and phone are required" });
            }
      
            const updatedProfile = await storage.updateSellerSettings(req.userId, settings);
      
            // Omit internal fields
            const { id, userId, createdAt, updatedAt, ...responseSettings } = updatedProfile;
            res.json(responseSettings);
          } catch (error: any) {
            console.error("Error updating seller settings:", error);
            res.status(500).json({ message: "Failed to update settings" });
          }
        });
      
      }

      const products = await storage.getSellerProducts(req.userId);
      res.json(products.map(p => ({
        id: p.productId,
        name: p.name,
        category: p.category || 'Uncategorized',
        price: p.price,
        stock: p.stock || 0,
        sold: 0, // Placeholder; compute from orders if needed
        description: p.description,
      })));
    } catch (error: any) {
      console.error("Error fetching seller inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

}
