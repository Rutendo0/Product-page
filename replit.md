# Product Page

## Overview

This is a full-stack e-commerce application for a car parts marketplace built with React, Express.js, and PostgreSQL. The application provides a comprehensive product browsing experience with filtering, search, comparison tools, and shopping cart functionality. It features a modern responsive design using Tailwind CSS and shadcn/ui components, with both grid and list view options for product display.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for cart state, TanStack Query for server state
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API with endpoints for products, orders, and health checks
- **Database Layer**: Drizzle ORM for type-safe database operations
- **Deployment**: Configured for both local development and Vercel serverless deployment

### Data Storage
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema**: Products table with comprehensive fields including pricing, inventory, and metadata
- **ORM**: Drizzle ORM with schema-first approach and TypeScript integration
- **Migrations**: Drizzle-kit for database schema management

### Key Features
- **Product Catalog**: Advanced filtering by category, brand, price range, and compatibility
- **Shopping Cart**: Persistent cart with localStorage, quantity management
- **Product Comparison**: Side-by-side comparison of up to 4 products
- **Responsive Design**: Mobile-first approach with grid/list view toggle
- **Search & Sort**: Multiple sorting options and real-time filtering
- **UI/UX**: 3D tilt effects, shine animations, and modern design patterns

## External Dependencies

### Database & ORM
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM with schema validation
- **drizzle-kit**: Database migration and schema management tools

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI components for accessibility
- **class-variance-authority**: Type-safe CSS utility classes
- **wouter**: Lightweight React router
- **react-hook-form**: Form handling with validation

### UI & Styling
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-shadcn-theme-json**: Theme configuration for shadcn/ui
- **lucide-react**: Icon library
- **react-icons**: Additional icon sets including FontAwesome

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds

### Deployment
- **vercel**: Serverless deployment platform
- **cross-env**: Cross-platform environment variable handling
- **dotenv**: Environment variable management