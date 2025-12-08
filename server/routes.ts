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
      const { restaurantName, cuisine, eventDate, location, notes, maxSeats, imageUrl, placeId, placePhotoName } = req.body;
      
      if (!restaurantName || !eventDate) {
        return res.status(400).json({ 
          error: "Restaurant name and date are required" 
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
        cuisine: cuisine || "Restaurant",
        eventDate: new Date(eventDate),
        location: location || null,
        notes: notes || null,
        maxSeats: maxSeats || null,
        status: "confirmed",
        pickerId: req.user!.id,
        imageUrl: imageUrl || null,
        placeId: placeId || null,
        placePhotoName: placePhotoName || null,
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

  // ============================================
  // WISHLIST ENDPOINTS
  // ============================================

  // Get user's wishlist
  app.get("/api/wishlist", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json([]);
    }
    
    try {
      const wishlist = await storage.getWishlistForUser(req.user!.id);
      res.json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ error: "Failed to fetch wishlist" });
    }
  });

  // Add to wishlist
  app.post("/api/wishlist", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json({ message: "Mock mode - wishlist not saved" });
    }
    
    try {
      const { name, address, cuisine, placeId, imageUrl } = req.body;
      
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Restaurant name is required" });
      }
      
      const wishlistItem = await storage.addWishlistRestaurant({
        userId: req.user!.id,
        name: name.trim(),
        address: address?.trim() || null,
        cuisine: cuisine?.trim() || null,
        placeId: placeId?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
      });
      
      res.json(wishlistItem);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ error: "Failed to add to wishlist" });
    }
  });

  // Remove from wishlist
  app.delete("/api/wishlist/:id", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json({ message: "Mock mode - wishlist not modified" });
    }
    
    try {
      await storage.removeWishlistRestaurant(req.params.id, req.user!.id);
      res.json({ message: "Removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ error: "Failed to remove from wishlist" });
    }
  });

  // ============================================
  // SOCIAL FEED ENDPOINT
  // ============================================

  // Get social feed (upcoming events from user's clubs, sorted soonest first)
  app.get("/api/social/feed", auth.requireAuth, async (req, res) => {
    if (useMockData) {
      return res.json({ items: [] });
    }
    
    try {
      const clubs = await storage.getUserClubs(req.user!.id);
      
      if (clubs.length === 0) {
        return res.json({ items: [] });
      }
      
      // Gather upcoming events from all clubs
      const feedItems: Array<{
        id: string;
        clubId: string;
        clubName: string;
        eventId: string;
        eventName: string;
        eventDate: string;
        attendingCount: number;
        maxSeats: number | null;
        location: string | null;
        cuisine: string;
      }> = [];
      
      for (const club of clubs) {
        // Get only upcoming events for this club (already filtered by date >= today)
        const clubEvents = await storage.getUpcomingEvents(club.id);
        
        // Take up to 10 upcoming events per club
        const upcomingEvents = clubEvents.slice(0, 10);
        
        for (const event of upcomingEvents) {
          const rsvps = await storage.getEventRsvps(event.id);
          const attendingCount = rsvps.filter(r => r.status === "attending").length;
          
          feedItems.push({
            id: `${club.id}-${event.id}`,
            clubId: club.id,
            clubName: club.name,
            eventId: event.id,
            eventName: event.restaurantName,
            eventDate: event.eventDate?.toISOString() || new Date().toISOString(),
            attendingCount,
            maxSeats: event.maxSeats,
            location: event.location,
            cuisine: event.cuisine,
          });
        }
      }
      
      // Sort by event date ascending (soonest first)
      feedItems.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
      
      res.json({ items: feedItems });
    } catch (error) {
      console.error("Error fetching social feed:", error);
      res.status(500).json({ error: "Failed to fetch social feed" });
    }
  });

  // ============================================
  // NEARBY RESTAURANTS ENDPOINT (Google Places API New)
  // ============================================

  // Interface for the response we send to the client
  interface NearbyRestaurant {
    id: string;
    name: string;
    address: string;
    primaryType?: string;
    lat: number;
    lng: number;
    rating?: number;
    priceLevel?: string;
    googleMapsUrl?: string;
    photoName?: string; // Google Places photo reference name
  }

  // Search nearby restaurants using Google Places API (New)
  app.get("/api/restaurants/nearby", auth.requireAuth, async (req, res) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      return res.status(501).json({ error: "Places API not configured" });
    }
    
    try {
      const { lat, lng, query } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ error: "lat and lng are required" });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Invalid lat/lng values" });
      }
      
      // Use Google Places API (New) - places:searchNearby
      const baseUrl = "https://places.googleapis.com/v1/places:searchNearby";
      
      // Build the request body
      const requestBody: any = {
        includedTypes: ["restaurant"],
        maxResultCount: 15,
        locationRestriction: {
          circle: {
            center: {
              latitude: latitude,
              longitude: longitude,
            },
            radius: 3000.0, // 3km radius
          },
        },
      };
      
      // If there's a text query, we need to use textSearch instead
      // For now, we'll use searchNearby which doesn't support text queries directly
      // The query parameter is ignored in the new API's searchNearby
      
      // Dev logging
      if (process.env.NODE_ENV === "development") {
        console.log("[Places API] Calling:", baseUrl);
        console.log("[Places API] Request body:", JSON.stringify(requestBody, null, 2));
      }
      
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.primaryType,places.location,places.rating,places.priceLevel,places.googleMapsUri,places.photos",
        },
        body: JSON.stringify(requestBody),
      });
      
      // Dev logging
      if (process.env.NODE_ENV === "development") {
        console.log("[Places API] Response status:", response.status);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Places API] HTTP error:", response.status, response.statusText);
        console.error("[Places API] Error body:", errorText);
        return res.status(500).json({ error: "Failed to search restaurants" });
      }
      
      const data = await response.json();
      
      // Dev logging
      if (process.env.NODE_ENV === "development") {
        console.log("[Places API] Response places count:", data.places?.length || 0);
      }
      
      // Check for API-level errors
      if (data.error) {
        console.error("[Places API] API error:", data.error.message, data.error.status);
        return res.status(500).json({ error: "Failed to search restaurants" });
      }
      
      // Map to our clean DTO format
      const places: NearbyRestaurant[] = (data.places || []).map((place: any) => ({
        id: place.id || "",
        name: place.displayName?.text || "Unknown",
        address: place.formattedAddress || "",
        primaryType: place.primaryType || undefined,
        lat: place.location?.latitude || 0,
        lng: place.location?.longitude || 0,
        rating: place.rating || undefined,
        priceLevel: place.priceLevel || undefined,
        googleMapsUrl: place.googleMapsUri || undefined,
        photoName: place.photos?.[0]?.name || undefined,
      }));
      
      res.json({ places });
    } catch (error) {
      console.error("[Places API] Error searching nearby restaurants:", error);
      res.status(500).json({ error: "Failed to search restaurants" });
    }
  });

  // ============================================
  // TEXT SEARCH RESTAURANTS ENDPOINT (Google Places API New)
  // ============================================

  // Search restaurants by text query (cuisine type or restaurant name)
  app.post("/api/restaurants/search", auth.requireAuth, async (req, res) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      return res.status(501).json({ error: "Restaurant search not configured yet. You can still type a name manually." });
    }
    
    try {
      const { query, lat, lng } = req.body;
      
      // Validate query
      if (!query || typeof query !== "string" || !query.trim()) {
        return res.status(400).json({ error: "Query is required" });
      }
      
      const trimmedQuery = query.trim();
      
      // Use Google Places API (New) - places:searchText
      const baseUrl = "https://places.googleapis.com/v1/places:searchText";
      
      // Build the request body
      const requestBody: any = {
        textQuery: trimmedQuery,
        includedType: "restaurant",
        maxResultCount: 10,
      };
      
      // Add location bias if lat/lng are provided
      if (lat !== undefined && lng !== undefined) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        
        if (!isNaN(latitude) && !isNaN(longitude)) {
          requestBody.locationBias = {
            circle: {
              center: {
                latitude: latitude,
                longitude: longitude,
              },
              radius: 3000.0, // 3km radius
            },
          };
        }
      }
      
      // Dev logging
      if (process.env.NODE_ENV === "development") {
        console.log("[Places Text Search] Calling:", baseUrl);
        console.log("[Places Text Search] Request body:", JSON.stringify(requestBody, null, 2));
      }
      
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.primaryType,places.location,places.rating,places.priceLevel,places.googleMapsUri,places.photos",
        },
        body: JSON.stringify(requestBody),
      });
      
      // Dev logging
      if (process.env.NODE_ENV === "development") {
        console.log("[Places Text Search] Response status:", response.status);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        if (process.env.NODE_ENV === "development") {
          console.error("[Places Text Search] HTTP error:", response.status, response.statusText);
          console.error("[Places Text Search] Error body:", errorText);
        }
        return res.status(500).json({ error: "Failed to search restaurants" });
      }
      
      const data = await response.json();
      
      // Dev logging
      if (process.env.NODE_ENV === "development") {
        console.log("[Places Text Search] Response places count:", data.places?.length || 0);
      }
      
      // Check for API-level errors
      if (data.error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[Places Text Search] API error:", data.error.message, data.error.status);
        }
        return res.status(500).json({ error: "Failed to search restaurants" });
      }
      
      // Map to our clean DTO format (same as nearby endpoint)
      const places: NearbyRestaurant[] = (data.places || []).map((place: any) => ({
        id: place.id || "",
        name: place.displayName?.text || "Unknown",
        address: place.formattedAddress || "",
        primaryType: place.primaryType || undefined,
        lat: place.location?.latitude || 0,
        lng: place.location?.longitude || 0,
        rating: place.rating || undefined,
        priceLevel: place.priceLevel || undefined,
        googleMapsUrl: place.googleMapsUri || undefined,
        photoName: place.photos?.[0]?.name || undefined,
      }));
      
      res.json({ places });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Places Text Search] Error searching restaurants:", error);
      }
      res.status(500).json({ error: "Failed to search restaurants" });
    }
  });

  // ============================================
  // RESTAURANT PHOTO PROXY ENDPOINT
  // ============================================

  // Proxy endpoint for Google Places photos (keeps API key server-side)
  // Note: No auth required - photoName values are opaque Google references
  // that are only obtainable from authenticated search endpoints
  app.get("/api/restaurants/photo", async (req, res) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      return res.status(501).json({ error: "Places API not configured" });
    }
    
    try {
      const { name, maxWidth } = req.query;
      
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Photo name is required" });
      }
      
      // Validate the photo name format (should start with "places/")
      if (!name.startsWith("places/")) {
        return res.status(400).json({ error: "Invalid photo name format" });
      }
      
      const maxWidthPx = parseInt(maxWidth as string) || 400;
      // Clamp to reasonable values
      const clampedWidth = Math.min(Math.max(maxWidthPx, 100), 1200);
      
      // Google Places API (New) photo endpoint
      const photoUrl = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${clampedWidth}&key=${apiKey}`;
      
      if (process.env.NODE_ENV === "development") {
        console.log("[Places Photo] Fetching photo:", name);
      }
      
      const response = await fetch(photoUrl, {
        redirect: "follow", // Follow redirects to get the actual image
      });
      
      if (!response.ok) {
        if (process.env.NODE_ENV === "development") {
          console.error("[Places Photo] Error:", response.status, response.statusText);
        }
        return res.status(502).json({ error: "Unable to load photo" });
      }
      
      // Get content type from Google's response
      const contentType = response.headers.get("content-type") || "image/jpeg";
      
      // Set appropriate headers
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
      
      // Stream the image data
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
      
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Places Photo] Error fetching photo:", error);
      }
      res.status(500).json({ error: "Failed to fetch photo" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
