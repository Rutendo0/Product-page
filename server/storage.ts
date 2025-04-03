import { 
  users, type User, type InsertUser, 
  type Product, type InsertProduct, type ProductFilter, 
  type ExternalProduct, externalProductSchema
} from "@shared/schema";
import { z } from "zod";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(filter?: ProductFilter): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductCategories(): Promise<string[]>;
  getProductBrands(): Promise<string[]>;
  getMinMaxPrices(): Promise<{min: number, max: number}>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<string, Product>;
  private externalApiUrl: string;

  currentId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.currentId = 1;
    this.externalApiUrl = 'https://c-ag.vercel.app/api/products';
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
          const product: Product = {
            id: this.currentId++,
            productId: typeof item.id === 'number' ? item.id.toString() : item.id || `prod-${Math.random()}`,
            name: item.name || 'Unknown Product',
            description: item.description || 'No description available',
            price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0),
            originalPrice: typeof item.originalPrice === 'string' ? parseFloat(item.originalPrice) : item.originalPrice,
            image: item.image || 'https://via.placeholder.com/150',
            category: item.category || 'Other',
            brand: item.brand || 'Generic',
            stock: Math.floor(Math.random() * 50) + 1, // Random stock
            sku: item.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
            createdAt: new Date(),
          };
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
}

export const storage = new MemStorage();
