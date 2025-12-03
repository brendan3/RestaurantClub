import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mockEvents, mockUser, mockClubs } from "./mockData";
import * as auth from "./auth";
import { generateJoinCode } from "@shared/schema";

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

  // ============================================
  // AUTH ENDPOINTS
  // ============================================
  
  app.post("/api/auth/signup", auth.signup);
  app.post("/api/auth/login", auth.login);
  app.post("/api/auth/logout", auth.logout);
  app.post("/api/auth/verify-email", auth.verifyEmail);
  app.post("/api/auth/resend-verification", auth.resendVerification);
  
  // Get current user (protected)
  app.get("/api/user/me", auth.requireAuth, auth.getCurrentUser);

  // ============================================
  // CLUB ENDPOINTS
  // ============================================
  
  // Get user's clubs
  app.get("/api/clubs/me", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json(mockClubs);
    }
    
    try {
      const clubs = await storage.getUserClubs(req.user!.id);
      
      // For each club, get members and include joinCode
      // Also auto-generate joinCode for clubs that don't have one
      const clubsWithMembers = await Promise.all(
        clubs.map(async (club) => {
          const members = await storage.getClubMembers(club.id);
          
          // If club doesn't have a joinCode, generate one
          let clubJoinCode = club.joinCode;
          if (!clubJoinCode) {
            clubJoinCode = generateJoinCode();
            await storage.updateClubJoinCode(club.id, clubJoinCode);
          }
          
          return {
            ...club,
            joinCode: clubJoinCode,
            members: members.length,
            membersList: members.map(m => ({
              id: m.id,
              name: m.name,
              avatar: m.avatar,
              role: m.role,
            })),
          };
        })
      );
      
      res.json(clubsWithMembers);
    } catch (error) {
      console.error("Error fetching user clubs:", error);
      res.status(500).json({ error: "Failed to fetch clubs" });
    }
  });
  
  // Create a new club
  app.post("/api/clubs", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json({ message: "Mock mode - club not created" });
    }
    
    try {
      const { name, type = "private" } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Club name is required" });
      }
      
      // Check if user already has a club (MVP: one club per user)
      const existingClubs = await storage.getUserClubs(req.user!.id);
      if (existingClubs.length > 0) {
        return res.status(409).json({ 
          error: "You already belong to a club",
          club: existingClubs[0]
        });
      }
      
      // Create club with a unique joinCode
      const joinCode = generateJoinCode();
      const club = await storage.createClub({
        name,
        type,
        joinCode,
      });
      
      // Add creator as owner
      await storage.addClubMember(club.id, req.user!.id, "owner");
      
      res.json(club);
    } catch (error) {
      console.error("Error creating club:", error);
      res.status(500).json({ error: "Failed to create club" });
    }
  });

  // Join a club with a joinCode
  app.post("/api/clubs/join", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json({ message: "Mock mode - cannot join club" });
    }
    
    try {
      const { joinCode } = req.body;
      
      if (!joinCode || typeof joinCode !== "string") {
        return res.status(400).json({ error: "Invite code is required" });
      }
      
      // Normalize to uppercase
      const normalizedCode = joinCode.trim().toUpperCase();
      
      // Look up club by joinCode
      const club = await storage.getClubByJoinCode(normalizedCode);
      if (!club) {
        return res.status(400).json({ error: "Invalid invite code" });
      }
      
      // Check if user is already a member
      const isAlreadyMember = await storage.isUserInClub(req.user!.id, club.id);
      if (isAlreadyMember) {
        return res.status(400).json({ error: "You are already a member of this club" });
      }
      
      // Add user as member
      await storage.addClubMember(club.id, req.user!.id, "member");
      
      res.json({ 
        message: "Successfully joined the club!",
        club: {
          id: club.id,
          name: club.name,
        }
      });
    } catch (error) {
      console.error("Error joining club:", error);
      res.status(500).json({ error: "Failed to join club" });
    }
  });
  
  // Get club by ID with members
  app.get("/api/clubs/:id", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json(mockClubs[0]);
    }
    
    try {
      const club = await storage.getClubById(req.params.id);
      if (!club) {
        return res.status(404).json({ error: "Club not found" });
      }
      
      const members = await storage.getClubMembers(club.id);
      
      res.json({
        ...club,
        members: members.length,
        membersList: members.map(m => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          role: m.role,
        })),
      });
    } catch (error) {
      console.error("Error fetching club:", error);
      res.status(500).json({ error: "Failed to fetch club" });
    }
  });

  // ============================================
  // EVENT ENDPOINTS
  // ============================================
  
  // Get all events for user's club
  app.get("/api/events", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json(mockEvents);
    }
    
    try {
      // Get user's club
      const clubs = await storage.getUserClubs(req.user!.id);
      if (clubs.length === 0) {
        return res.json([]);
      }
      
      const events = await storage.getEvents(clubs[0].id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Get upcoming events
  app.get("/api/events/upcoming", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json(mockEvents.filter(e => e.status === "confirmed"));
    }
    
    try {
      const clubs = await storage.getUserClubs(req.user!.id);
      if (clubs.length === 0) {
        return res.json([]);
      }
      
      const events = await storage.getUpcomingEvents(clubs[0].id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      res.status(500).json({ error: "Failed to fetch upcoming events" });
    }
  });

  // Get past events
  app.get("/api/events/past", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json(mockEvents.filter(e => e.status === "past"));
    }
    
    try {
      const clubs = await storage.getUserClubs(req.user!.id);
      if (clubs.length === 0) {
        return res.json([]);
      }
      
      const events = await storage.getPastEvents(clubs[0].id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching past events:", error);
      res.status(500).json({ error: "Failed to fetch past events" });
    }
  });
  
  // Create a new event
  app.post("/api/events", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json({ message: "Mock mode - event not created" });
    }
    
    try {
      const { restaurantName, cuisine, eventDate, location, notes, maxSeats, imageUrl } = req.body;
      
      if (!restaurantName || !cuisine || !eventDate) {
        return res.status(400).json({ 
          error: "Restaurant name, cuisine, and date are required" 
        });
      }
      
      // Validate maxSeats if provided
      if (maxSeats !== undefined && (typeof maxSeats !== 'number' || maxSeats < 1 || maxSeats > 100)) {
        return res.status(400).json({ 
          error: "Max seats must be a number between 1 and 100" 
        });
      }
      
      // Get user's club
      const clubs = await storage.getUserClubs(req.user!.id);
      if (clubs.length === 0) {
        return res.status(400).json({ 
          error: "You must be in a club to create events" 
        });
      }
      
      // Create event
      const event = await storage.createEvent({
        clubId: clubs[0].id,
        restaurantName,
        cuisine,
        eventDate: new Date(eventDate),
        location: location || null,
        notes: notes || null,
        maxSeats: maxSeats || null,
        status: "confirmed",
        pickerId: req.user!.id,
        imageUrl: imageUrl || null,
      });
      
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });
  
  // Update an event (notes, location, etc.)
  app.patch("/api/events/:id", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json({ message: "Mock mode - event not updated" });
    }
    
    try {
      const eventId = req.params.id;
      const { notes, location, maxSeats } = req.body;
      
      // Check if event exists
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Check if user is in the event's club
      const clubs = await storage.getUserClubs(req.user!.id);
      const isInClub = clubs.some(c => c.id === event.clubId);
      if (!isInClub) {
        return res.status(403).json({ 
          error: "You must be a member of the club to update events" 
        });
      }
      
      // Update event
      const updatedEvent = await storage.updateEvent(eventId, {
        notes: notes !== undefined ? notes : undefined,
        location: location !== undefined ? location : undefined,
        maxSeats: maxSeats !== undefined ? maxSeats : undefined,
      });
      
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  });
  
  // Get event by ID with RSVPs
  app.get("/api/events/:id", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      const event = mockEvents.find(e => e.id === req.params.id);
      return res.json(event || null);
    }
    
    try {
      const event = await storage.getEventById(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Get RSVPs
      const rsvps = await storage.getEventRsvps(event.id);
      
      res.json({
        ...event,
        rsvps,
      });
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  // ============================================
  // RSVP ENDPOINTS
  // ============================================
  
  // Create or update RSVP
  app.post("/api/events/:id/rsvp", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json({ message: "Mock mode - RSVP not saved" });
    }
    
    try {
      const { status } = req.body;
      const eventId = req.params.id;
      
      if (!status || !["attending", "declined", "maybe"].includes(status)) {
        return res.status(400).json({ 
          error: "Valid status is required (attending, declined, or maybe)" 
        });
      }
      
      // Check if event exists
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Check if user is in the event's club
      const clubs = await storage.getUserClubs(req.user!.id);
      const isInClub = clubs.some(c => c.id === event.clubId);
      if (!isInClub) {
        return res.status(403).json({ 
          error: "You must be a member of the club to RSVP" 
        });
      }
      
      // Check if RSVP already exists
      const existingRsvp = await storage.getUserRsvp(eventId, req.user!.id);
      
      // Capacity enforcement: only check when trying to attend (not decline/maybe)
      if (status === "attending" && event.maxSeats) {
        const currentRsvps = await storage.getEventRsvps(eventId);
        const attendingCount = currentRsvps.filter(r => r.status === "attending").length;
        
        // If user is already attending, they can stay (no-op for capacity)
        const wasAlreadyAttending = existingRsvp?.status === "attending";
        
        if (!wasAlreadyAttending && attendingCount >= event.maxSeats) {
          return res.status(400).json({ error: "Event is full" });
        }
      }
      
      if (existingRsvp) {
        // Update existing RSVP
        await storage.updateRsvp(eventId, req.user!.id, status);
      } else {
        // Create new RSVP
        await storage.createRsvp(eventId, req.user!.id, status);
      }
      
      res.json({ message: "RSVP saved successfully", status });
    } catch (error) {
      console.error("Error saving RSVP:", error);
      res.status(500).json({ error: "Failed to save RSVP" });
    }
  });
  
  // Get RSVPs for an event
  app.get("/api/events/:id/rsvps", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json([]);
    }
    
    try {
      const eventId = req.params.id;
      
      // Check if event exists
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      const rsvps = await storage.getEventRsvps(eventId);
      res.json(rsvps);
    } catch (error) {
      console.error("Error fetching RSVPs:", error);
      res.status(500).json({ error: "Failed to fetch RSVPs" });
    }
  });
  
  // Get user's RSVP for an event
  app.get("/api/events/:id/rsvp/me", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json(null);
    }
    
    try {
      const eventId = req.params.id;
      const rsvp = await storage.getUserRsvp(eventId, req.user!.id);
      res.json(rsvp || null);
    } catch (error) {
      console.error("Error fetching user RSVP:", error);
      res.status(500).json({ error: "Failed to fetch RSVP" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
