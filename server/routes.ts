import type { Express, Request, Response } from "express";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<void> {
  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
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

  // Create order
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
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
      });

      res.status(201).json(created);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // List orders (debug)
  app.get("/api/orders", async (_req: Request, res: Response) => {
    try {
      const orders = await storage.listOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error listing orders:", error);
      res.status(500).json({ message: "Failed to list orders" });
    }
  });
}
