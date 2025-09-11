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
}
