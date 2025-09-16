import { z } from "zod";
import { eq } from "drizzle-orm";

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
  sellerId?: number;
  createdAt: Date;
  supplier?: string;
  make?: string;
  OEM?: string;
  model?: string;
  year?: number;
  industry?: string;
  images?: { url: string }[];
};

export type InsertProduct = Omit<Product, 'id' | 'createdAt'> & { productId?: string };

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
  search?: string;
};

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

export type Session = { id: number; userId: number; token: string; expiresAt: Date; createdAt: Date };
export type InsertSession = { userId: number; token: string; expiresAt: Date };

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSessionByToken(token: string): Promise<void>;
  getProducts(filter?: ProductFilter): Promise<{ products: Product[]; total: number }>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductCategories(): Promise<string[]>;
  getProductBrands(): Promise<string[]>;
  getMinMaxPrices(): Promise<{ min: number; max: number }>;
  createOrder(order: InsertOrder): Promise<Order>;
  listOrders(): Promise<Order[]>;
  listUserOrders(userId: number): Promise<Order[]>;
}

import { orders as ordersTable, orderItems as orderItemsTable, users as usersTable, sessions as sessionsTable } from '@shared/schema';

export class MemStorage implements IStorage {
  private products: Map<string, Product> = new Map();
  private orders: Map<string, Order> = new Map();
  private externalApiUrl: string = 'https://c-ag.vercel.app/api/products';

  private currentId: number = 1;

  constructor() {}

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
    if (this.products.size === 0) {
      try {
        console.log("Fetching products from", this.externalApiUrl);
        const response = await fetch(this.externalApiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Sample of first product data:", JSON.stringify(data[0], null, 2));
        
        for (const item of data) {
          let imageUrl = 'https://via.placeholder.com/150';
          
          if (item.images && Array.isArray(item.images) && item.images.length > 0 && item.images[0].url) {
            imageUrl = item.images[0].url;
          } else if (item.image) {
            imageUrl = item.image;
          }
          
          const productId = typeof item.id === 'number' ? item.id.toString() : item.id || `prod-${Math.random()}`;
          const product: Product = {
            id: this.currentId++,
            productId,
            name: item.name || 'Unknown Product',
            description: item.description || 'No description available',
            price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0),
            originalPrice: typeof item.originalPrice === 'string' ? parseFloat(item.originalPrice) : item.originalPrice,
            image: imageUrl,
            category: item.category || 'Other',
            brand: item.brand || 'Generic',
            stock: Math.floor(Math.random() * 50) + 1,
            sku: item.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
            sellerId: undefined,
            createdAt: new Date(),
            supplier: item.supplier,
            make: item.make,
            OEM: item.OEM,
            model: item.model,
            year: item.year,
            industry: item.industry,
            images: item.images,
          };
          
          this.products.set(productId, product);
        }
      } catch (error) {
        console.error('Error fetching products from external API:', error);
        return [];
      }
    }
    
    return Array.from(this.products.values());
  }

  async getProducts(filter?: ProductFilter): Promise<{ products: Product[]; total: number }> {
    let products = await this.fetchExternalProducts();
  
    if (filter?.suppliers && filter.suppliers.length > 0) {
      const suppliers = filter.suppliers;
      products = products.filter(product =>
        product.supplier && suppliers.includes(product.supplier)
      );
    }
  
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
      if (filter.categories && filter.categories.length > 0) {
        const categories = filter.categories;
        products = products.filter(product =>
          product.category && categories.includes(product.category)
        );
      }
      
      if (filter.brands && filter.brands.length > 0) {
        const brands = filter.brands;
        products = products.filter(product =>
          product.brand && brands.includes(product.brand)
        );
      }
      
      if (filter.minPrice !== undefined) {
        products = products.filter(product => product.price >= filter.minPrice!);
      }
      
      if (filter.maxPrice !== undefined) {
        products = products.filter(product => product.price <= filter.maxPrice!);
      }
  
      if (filter?.search) {
        const query = filter.search.toLowerCase();
        products = products.filter(product =>
          product.name.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query)) ||
          (product.brand && product.brand.toLowerCase().includes(query)) ||
          (product.category && product.category.toLowerCase().includes(query))
        );
      }
      
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
        }
      }
    }
  
    const total = products.length;
  
    if (filter?.page !== undefined && filter.limit !== undefined) {
      const startIndex = (filter.page - 1) * filter.limit;
      products = products.slice(startIndex, startIndex + filter.limit);
    }
    
    return { products, total };
  }

  async getProduct(id: string): Promise<Product | undefined> {
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
    this.orders.set(id, created);
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
    return Array.from(this.orders.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
