import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
interface AuthRequest extends Request {
  userId?: number;
}

const authMiddleware = (req: AuthRequest, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Authorization header required" });
  }

  const token = authHeader.substring(7);
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export async function registerRoutes(app: Express): Promise<void> {
  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
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

      const products = await storage.getProducts(filter);
      res.json(products);
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

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-11-20',
      });

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
}
