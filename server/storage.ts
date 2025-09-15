import { z } from "zod";
import { eq } from "drizzle-orm";

// Lightweight runtime-only types to avoid pulling in shared schema on Vercel
export type User = { id: number; username: string; email: string; password: string };
export type InsertUser = { username: string; email: string; password: string };

export type Product = {
  id: number;
  productId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  brand?: string;
  stock?: number;
  sku?: string;
  createdAt: Date;
  supplier?: string;
  make?: string;
  // Optional external fields
  OEM?: string;
  model?: string;
  year?: number;
  industry?: string;
  images?: { url: string }[];
};

export type ProductFilter = {
  categories?: string[];
  brands?: string[];
  suppliers?: string[];
  minPrice?: number;
  maxPrice?: number;
  compatibility?: { make?: string; model?: string; year?: string };
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
  page?: number;
  limit?: number;
};

// Order types
export type OrderItem = { productId: string; name: string; price: number; quantity: number };
export type Order = {
  id: string;
  userId?: number | null;
  items: OrderItem[];
  subtotal: number;
  paymentMethod: 'card' | 'mobile' | 'cash';
  deliver: boolean;
  location?: string;
  fullName: string;
  phone: string;
  email: string;
  notes?: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  createdAt: Date;
};
export type InsertOrder = Omit<Order, 'id' | 'createdAt' | 'status'>;

// Session types
export type Session = { id: number; userId: number; token: string; expiresAt: Date; createdAt: Date };
export type InsertSession = { userId: number; token: string; expiresAt: Date };

// modify the interface with any CRUD methods you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSessionByToken(token: string): Promise<void>;
  // Product methods
  getProducts(filter?: ProductFilter): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductCategories(): Promise<string[]>;
  getProductBrands(): Promise<string[]>;
  getMinMaxPrices(): Promise<{ min: number; max: number }>;
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  listOrders(): Promise<Order[]>;
  listUserOrders(userId: number): Promise<Order[]>;
}

import { orders as ordersTable, orderItems as orderItemsTable, users as usersTable, sessions as sessionsTable } from '@shared/schema';

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private externalApiUrl: string;

  currentId: number;

  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.currentId = 1;
    this.externalApiUrl = 'https://c-ag.vercel.app/api/products';
  }

  async getUser(id: number): Promise<User | undefined> {
      const { db } = await import('./db');
      const [user] = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .limit(1);
      if (!user) return undefined;
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
      };
    }

  async getUserByUsername(username: string): Promise<User | undefined> {
      const { db } = await import('./db');
      const [user] = await db.select()
        .from(usersTable)
        .where(eq(usersTable.username, username))
        .limit(1);
      if (!user) return undefined;
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
      };
    }

  async createUser(insertUser: InsertUser): Promise<User> {
      const { db } = await import('./db');
      // Use DB insert
      const [newUser] = await db.insert(usersTable)
        .values(insertUser)
        .returning();
      const user: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
      };
      return user;
    }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
      const { db } = await import('./db');
      const [user] = await db.select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);
      if (!user) return undefined;
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
      };
    }

  private async fetchExternalProducts(): Promise<Product[]> {
    // Only fetch if we don't have products yet
    if (this.products.size === 0) {
      try {
        console.log("Fetching products from", this.externalApiUrl);
        const response = await fetch(this.externalApiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Sample of first product data:", JSON.stringify(data[0], null, 2));
        
        // Manually map the data to our internal format instead of using Zod validation
        for (const item of data) {
          // Get image URL from different possible sources in the API data
          let imageUrl = 'https://via.placeholder.com/150';
          
          // Check if item has images array
          if (item.images && Array.isArray(item.images) && item.images.length > 0 && item.images[0].url) {
            imageUrl = item.images[0].url;
          } 
          // Fallback to image property if images array is not available
          else if (item.image) {
            imageUrl = item.image;
          }
          
          const product: Product = {
            id: this.currentId++,
            productId: typeof item.id === 'number' ? item.id.toString() : item.id || `prod-${Math.random()}`,
            name: item.name || 'Unknown Product',
            description: item.description || 'No description available',
            price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0),
            originalPrice: typeof item.originalPrice === 'string' ? parseFloat(item.originalPrice) : item.originalPrice,
            image: imageUrl,
            category: item.category || 'Other',
            brand: item.brand || 'Generic',
            stock: Math.floor(Math.random() * 50) + 1, // Random stock
            sku: item.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
            createdAt: new Date(),
          } as Product & { make?: string; supplier?: string };
          
          // Add custom properties from external API for frontend use
          // We'll store these properties but they won't be in our schema
          // @ts-ignore - Adding additional properties to match external API
          if (item.OEM) product.OEM = item.OEM;
          // @ts-ignore
          if (item.model) product.model = item.model;
          // @ts-ignore
          if (item.year) product.year = item.year;
          // @ts-ignore
          if (item.industry) product.industry = item.industry;
          // @ts-ignore
          if (item.supplier) product.supplier = item.supplier;
          // @ts-ignore
          if (item.make) product.make = item.make;
                    
          this.products.set(product.productId, product);
        }
      } catch (error) {
        console.error('Error fetching products from external API:', error);
        console.error(error);
        // Return empty array rather than throwing, to be more resilient
        return [];
      }
    }
    
    return Array.from(this.products.values());
  }

  async getProducts(filter?: ProductFilter): Promise<Product[]> {
    let products = await this.fetchExternalProducts();
  
    // Apply supplier filter if provided
    if (filter?.suppliers && filter.suppliers.length > 0) {
      products = products.filter(product =>
        product.supplier && filter.suppliers?.includes(product.supplier)
      );
    }
  
    // Apply compatibility filter
    if (filter?.compatibility) {
      const { make, model, year } = filter.compatibility;
      if (make) {
        products = products.filter(product =>
          product.make && product.make.toLowerCase().includes(make.toLowerCase())
        );
      }
      if (model) {
        products = products.filter(product =>
          product.model && product.model.toLowerCase().includes(model.toLowerCase())
        );
      }
      if (year) {
        products = products.filter(product =>
          product.year && product.year.toString() === year
        );
      }
    }
    
    if (filter) {
      // Apply category filter
      if (filter.categories && filter.categories.length > 0) {
        products = products.filter(product => 
          product.category && filter.categories?.includes(product.category)
        );
      }
      
      // Apply brand filter
      if (filter.brands && filter.brands.length > 0) {
        products = products.filter(product => 
          product.brand && filter.brands?.includes(product.brand)
        );
      }
      
      // Apply price filter
      if (filter.minPrice !== undefined) {
        products = products.filter(product => product.price >= filter.minPrice!);
      }
      
      if (filter.maxPrice !== undefined) {
        products = products.filter(product => product.price <= filter.maxPrice!);
      }
      
      // Apply sorting
      if (filter.sort) {
        switch (filter.sort) {
          case 'price-asc':
            products.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            products.sort((a, b) => b.price - a.price);
            break;
          case 'name-asc':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'name-desc':
            products.sort((a, b) => b.name.localeCompare(a.name));
            break;
          // Default is 'featured', no sorting needed
        }
      }
      
      // Apply pagination if specified
      if (filter.page !== undefined && filter.limit !== undefined) {
        const startIndex = (filter.page - 1) * filter.limit;
        products = products.slice(startIndex, startIndex + filter.limit);
      }
    }
    
    return products;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    // Make sure products are loaded
    await this.fetchExternalProducts();
    return this.products.get(id);
  }

  async getProductCategories(): Promise<string[]> {
    const products = await this.fetchExternalProducts();
    const categoriesSet = new Set<string>();
    
    products.forEach(product => {
      if (product.category) {
        categoriesSet.add(product.category);
      }
    });
    
    return Array.from(categoriesSet);
  }

  async getProductBrands(): Promise<string[]> {
    const products = await this.fetchExternalProducts();
    const brandsSet = new Set<string>();
    
    products.forEach(product => {
      if (product.brand) {
        brandsSet.add(product.brand);
      }
    });
    
    return Array.from(brandsSet);
  }

  async getMinMaxPrices(): Promise<{ min: number; max: number }> {
    const products = await this.fetchExternalProducts();
    
    if (products.length === 0) {
      return { min: 0, max: 500 };
    }
    
    let min = products[0].price;
    let max = products[0].price;
    
    products.forEach(product => {
      if (product.price < min) min = product.price;
      if (product.price > max) max = product.price;
    });
    
    return { min, max };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
      const { db } = await import('./db');
      const id = `ord_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      const createdAt = new Date();
  
      // Persist to Postgres
      await db.insert(ordersTable).values({
        id,
        userId: order.userId || null,
        subtotal: order.subtotal,
        paymentMethod: order.paymentMethod,
        deliver: order.deliver,
        location: order.location,
        fullName: order.fullName,
        phone: order.phone,
        email: order.email,
        notes: order.notes,
        status: 'pending',
        createdAt,
      });
  
      if (order.items?.length) {
        await db.insert(orderItemsTable).values(
          order.items.map((it) => ({
            orderId: id,
            productId: it.productId,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
          }))
        );
      }
  
      const created: Order = { id, status: 'pending', createdAt, ...order };
      this.orders.set(id, created); // Also keep in-memory cache for quick GET
      return created;
    }
  
  async createSession(session: InsertSession): Promise<Session> {
      const { db } = await import('./db');
      const [newSession] = await db.insert(sessionsTable)
        .values(session)
        .returning();
      return {
        id: newSession.id,
        userId: newSession.userId,
        token: newSession.token,
        expiresAt: newSession.expiresAt,
        createdAt: newSession.createdAt ?? new Date(),
      };
    }
  
  async getSessionByToken(token: string): Promise<Session | undefined> {
      const { db } = await import('./db');
      const [session] = await db.select()
        .from(sessionsTable)
        .where(eq(sessionsTable.token, token));
      if (!session) return undefined;
      return {
        id: session.id,
        userId: session.userId,
        token: session.token,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt ?? new Date(),
      };
    }
  
  async deleteSessionByToken(token: string): Promise<void> {
      const { db } = await import('./db');
      await db.delete(sessionsTable)
        .where(eq(sessionsTable.token, token));
    }

  async listOrders(): Promise<Order[]> {
    // Return from cache for now; could join from DB if needed
    return Array.from(this.orders.values()).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async listUserOrders(userId: number): Promise<Order[]> {
      const { db } = await import('./db');
      const orderRows = await db.select()
        .from(ordersTable)
        .where(eq(ordersTable.userId, userId))
        .orderBy(ordersTable.createdAt);
  
      const orders: Order[] = [];
      for (const orderRow of orderRows) {
        const itemRows = await db.select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, orderRow.id));
  
        const orderItems: OrderItem[] = itemRows.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }));
  
        orders.push({
          id: orderRow.id,
          userId: orderRow.userId || undefined,
          items: orderItems,
          subtotal: orderRow.subtotal,
          paymentMethod: orderRow.paymentMethod as 'card' | 'mobile' | 'cash',
          deliver: orderRow.deliver,
          location: orderRow.location || undefined,
          fullName: orderRow.fullName,
          phone: orderRow.phone,
          email: orderRow.email,
          notes: orderRow.notes || undefined,
          status: orderRow.status as 'pending' | 'paid' | 'shipped' | 'delivered',
          createdAt: orderRow.createdAt ?? new Date(),
        });
      }
  
      return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
}

export const storage = new MemStorage();
