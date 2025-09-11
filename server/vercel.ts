import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./vite";

let appPromise: Promise<Express> | null = null;

async function createApp(): Promise<Express> {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Minimal request logging for API routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (req.path.startsWith("/api")) {
        log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
      }
    });
    next();
  });

  // Register API routes (returns an http.Server in local mode; unused on Vercel)
  await registerRoutes(app);

  return app;
}

export default async function handler(req: Request, res: Response) {
  if (!appPromise) appPromise = createApp();
  const app = await appPromise;
  // Delegate handling to the Express app
  return (app as unknown as (req: Request, res: Response) => void)(req, res);
}