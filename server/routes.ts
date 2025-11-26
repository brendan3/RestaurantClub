import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mockEvents, mockUser, mockClubs } from "./mockData";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  // Events endpoints
  app.get("/api/events", (_req, res) => {
    res.json(mockEvents);
  });

  app.get("/api/events/upcoming", (_req, res) => {
    const upcoming = mockEvents.filter(e => e.status === "confirmed");
    res.json(upcoming);
  });

  app.get("/api/events/past", (_req, res) => {
    const past = mockEvents.filter(e => e.status === "past");
    res.json(past);
  });

  // User endpoints
  app.get("/api/user/me", (_req, res) => {
    res.json(mockUser);
  });

  // Clubs endpoints
  app.get("/api/clubs", (_req, res) => {
    res.json(mockClubs);
  });

  const httpServer = createServer(app);

  return httpServer;
}
