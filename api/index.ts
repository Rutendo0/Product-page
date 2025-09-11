import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { log } from "../server/logger";

let appPromise: Promise<Express> | null = null;

async function createApp(): Promise<Express> {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (req.url.startsWith("/api")) {
        log(`${req.method} ${req.url} ${res.statusCode} in ${duration}ms`);
      }
    });
    next();
  });

  await registerRoutes(app);
  return app;
}

export default async function handler(req: any, res: any) {
  try {
    if (!appPromise) appPromise = createApp();
    const app = await appPromise;
    return (app as unknown as (req: any, res: any) => void)(req, res);
  } catch (err: any) {
    console.error("API handler error:", err?.stack || err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Internal Server Error" }));
  }
}