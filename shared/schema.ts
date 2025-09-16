import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
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
  sellerId: integer("seller_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productSchema = createInsertSchema(products);

// Extend the base Product type with additional fields from the API
export type Product = typeof products.$inferSelect & {
  // Optional additional fields from external API
  OEM?: string;
  make?: string;
  model?: string;
  year?: number;
  industry?: string;
  supplier?: string;
  // These will be used for images array from external API
  images?: { url: string }[];
};

export type InsertProduct = typeof products.$inferInsert;

// Product filtering schema
export const productFilterSchema = z.object({
  categories: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  suppliers: z.array(z.string()).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().optional(),
  compatibility: z
    .object({ make: z.string().optional(), model: z.string().optional(), year: z.string().optional() })
    .partial()
    .optional(),
  sort: z.enum(['featured', 'price-asc', 'price-desc', 'name-asc', 'name-desc', 'newest', 'popularity', 'rating-desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).optional(),
});

export type ProductFilter = z.infer<typeof productFilterSchema>;

// Orders schema (PostgreSQL)
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  subtotal: doublePrecision("subtotal").notNull(),
  paymentMethod: text("payment_method").notNull(),
  deliver: boolean("deliver").notNull(),
  location: text("location"),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status").default("pending").notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  quantity: integer("quantity").notNull(),
});

export type OrderRow = typeof orders.$inferSelect;
export type InsertOrderRow = typeof orders.$inferInsert & { userId?: number | null; status?: string };
export type OrderItemRow = typeof orderItems.$inferSelect;
export type InsertOrderItemRow = typeof orderItems.$inferInsert;

// External API product schema
export const externalProductSchema = z.object({
  id: z.union([z.string(), z.number().transform(val => val.toString())]),
  name: z.string(),
  description: z.string().optional(),
  price: z.union([
    z.string().transform(val => parseFloat(val)),
    z.number()
  ]),
  image: z.string().optional(),
  // Images array from the API
  images: z.array(z.object({
    url: z.string()
  })).optional(),
  category: z.string().optional(),
  originalPrice: z.union([
    z.string().transform(val => parseFloat(val)),
    z.number(),
    z.undefined()
  ]).optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  // Additional fields from the external API
  OEM: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  industry: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export type ExternalProduct = z.infer<typeof externalProductSchema>;

// Sessions schema for authentication
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SessionRow = typeof sessions.$inferSelect;
export type InsertSessionRow = typeof sessions.$inferInsert;

