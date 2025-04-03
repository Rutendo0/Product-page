import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  productId: text("product_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  originalPrice: doublePrecision("original_price"),
  image: text("image").notNull(),
  category: text("category"),
  brand: text("brand"),
  stock: integer("stock").default(0),
  sku: text("sku"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productSchema = createInsertSchema(products);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Product filtering schema
export const productFilterSchema = z.object({
  categories: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().optional(),
  sort: z.enum(['featured', 'price-asc', 'price-desc', 'name-asc', 'name-desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).optional(),
});

export type ProductFilter = z.infer<typeof productFilterSchema>;

// External API product schema
export const externalProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.string().transform(val => parseFloat(val)),
  image: z.string(),
  category: z.string().optional(),
  originalPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  brand: z.string().optional(),
  sku: z.string().optional(),
});

export type ExternalProduct = z.infer<typeof externalProductSchema>;
