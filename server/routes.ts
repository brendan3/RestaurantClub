import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mockEvents, mockUser, mockClubs } from "./mockData";

export async function registerRoutes(app: Express): Promise<Server> {
  const useMockData = !process.env.DATABASE_URL;
  
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      database: useMockData ? "mock" : "connected"
    });
  });

  // Events endpoints
  app.get("/api/events", async (_req, res) => {
    if (useMockData) {
      return res.json(mockEvents);
    }
    
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/upcoming", async (_req, res) => {
    if (useMockData) {
      return res.json(mockEvents.filter(e => e.status === "confirmed"));
    }
    
    try {
      const events = await storage.getUpcomingEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      res.status(500).json({ error: "Failed to fetch upcoming events" });
    }
  });

  app.get("/api/events/past", async (_req, res) => {
    if (useMockData) {
      return res.json(mockEvents.filter(e => e.status === "past"));
    }
    
    try {
      const events = await storage.getPastEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching past events:", error);
      res.status(500).json({ error: "Failed to fetch past events" });
    }
  });

  // User endpoints
  app.get("/api/user/me", async (_req, res) => {
    if (useMockData) {
      return res.json(mockUser);
    }
    
    try {
      // For now, return mock data for current user
      // In production, this would use session/auth
      res.json(mockUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Clubs endpoints
  app.get("/api/clubs", async (_req, res) => {
    if (useMockData) {
      return res.json(mockClubs);
    }
    
    try {
      // For now, return mock data
      // In production, this would use actual user ID from session
      res.json(mockClubs);
    } catch (error) {
      console.error("Error fetching clubs:", error);
      res.status(500).json({ error: "Failed to fetch clubs" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
