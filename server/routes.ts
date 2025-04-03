import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { productFilterSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // Get all products with optional filtering
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const queryParams = req.query;
      
      // Parse and validate filter parameters
      const filter = {
        categories: queryParams.categories ? 
          Array.isArray(queryParams.categories) ? 
            queryParams.categories as string[] : 
            [queryParams.categories as string] : 
          undefined,
        brands: queryParams.brands ? 
          Array.isArray(queryParams.brands) ? 
            queryParams.brands as string[] : 
            [queryParams.brands as string] : 
          undefined,
        minPrice: queryParams.minPrice ? parseFloat(queryParams.minPrice as string) : undefined,
        maxPrice: queryParams.maxPrice ? parseFloat(queryParams.maxPrice as string) : undefined,
        sort: queryParams.sort as any,
        page: queryParams.page ? parseInt(queryParams.page as string, 10) : undefined,
        limit: queryParams.limit ? parseInt(queryParams.limit as string, 10) : undefined,
      };
      
      // Validate filter
      const parsedFilter = productFilterSchema.parse(filter);
      
      const products = await storage.getProducts(parsedFilter);
      res.json(products);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid filter parameters", errors: error.errors });
      } else {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Failed to fetch products" });
      }
    }
  });

  // Get a single product by ID
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const productId = req.params.id;
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
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

  const httpServer = createServer(app);

  return httpServer;
}
