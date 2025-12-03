import { eq, desc, asc, and } from "drizzle-orm";
import { db } from "./db"; // <-- FIX 1: Import 'db' directly (not getDb)
import { 
  users, events, clubs, clubMembers, eventAttendees, eventTags,
  type User, type InsertUser, type Event, type Club 
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // private db = getDb(); <-- DELETE: No longer needed. Use imported 'db' instead.

  async getUser(id: string): Promise<User | undefined> {
    // if (!this.db) return undefined; <-- DELETE: No longer needed as 'db' is always imported.
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // if (!this.db) return undefined;
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.verificationToken, token)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // if (!this.db) throw new Error("Database not connected");
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserVerification(userId: string, data: {
    emailVerified?: boolean;
    verificationToken?: string | null;
    verificationExpires?: Date | null;
  }): Promise<User> {
    const updateData: any = {};
    if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;
    if (data.verificationToken !== undefined) updateData.verificationToken = data.verificationToken;
    if (data.verificationExpires !== undefined) updateData.verificationExpires = data.verificationExpires;
    
    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    return result[0];
  }

  async getEvents(clubId?: string): Promise<Event[]> {
    // if (!this.db) return [];
    
    const query = clubId 
      ? db.select().from(events).where(eq(events.clubId, clubId)).orderBy(desc(events.eventDate))
      : db.select().from(events).orderBy(desc(events.eventDate));
    
    return await query;
  }

  async getUpcomingEvents(clubId?: string): Promise<Event[]> {
    // if (!this.db) return [];
    
    const conditions = clubId
      ? and(eq(events.status, "confirmed"), eq(events.clubId, clubId))
      : eq(events.status, "confirmed");
    
    return await db
      .select()
      .from(events)
      .where(conditions!)
      .orderBy(asc(events.eventDate));
  }

  async getPastEvents(clubId?: string): Promise<Event[]> {
    // if (!this.db) return [];
    
    const conditions = clubId
      ? and(eq(events.status, "past"), eq(events.clubId, clubId))
      : eq(events.status, "past");
    
    return await db
      .select()
      .from(events)
      .where(conditions!)
      .orderBy(desc(events.eventDate));
  }

  async getEventById(id: string): Promise<Event | undefined> {
    // if (!this.db) return undefined;
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async createEvent(event: any): Promise<Event> {
    // if (!this.db) throw new Error("Database not connected");
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async updateEvent(id: string, updates: { notes?: string; location?: string; maxSeats?: number }): Promise<Event> {
    const updateData: any = {};
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.maxSeats !== undefined) updateData.maxSeats = updates.maxSeats;
    
    const result = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();
    
    return result[0];
  }

  async getUserClubs(userId: string): Promise<Club[]> {
    // if (!this.db) return [];
    
    const result = await db
      .select({
        id: clubs.id,
        name: clubs.name,
        type: clubs.type,
        joinCode: clubs.joinCode,
        createdAt: clubs.createdAt,
      })
      .from(clubs)
      .innerJoin(clubMembers, eq(clubs.id, clubMembers.clubId))
      .where(eq(clubMembers.userId, userId));
    
    return result;
  }

  async getClubById(id: string): Promise<Club | undefined> {
    // if (!this.db) return undefined;
    const result = await db.select().from(clubs).where(eq(clubs.id, id)).limit(1);
    return result[0];
  }

  async getClubByJoinCode(joinCode: string): Promise<Club | undefined> {
    const result = await db.select().from(clubs).where(eq(clubs.joinCode, joinCode)).limit(1);
    return result[0];
  }

  async createClub(clubData: any): Promise<Club> {
    const result = await db.insert(clubs).values(clubData).returning();
    return result[0];
  }

  async updateClubJoinCode(clubId: string, joinCode: string): Promise<void> {
    await db
      .update(clubs)
      .set({ joinCode })
      .where(eq(clubs.id, clubId));
  }

  async addClubMember(clubId: string, userId: string, role: string = "member"): Promise<void> {
    await db.insert(clubMembers).values({
      clubId,
      userId,
      role,
    });
  }

  async isUserInClub(userId: string, clubId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(clubMembers)
      .where(and(eq(clubMembers.userId, userId), eq(clubMembers.clubId, clubId)))
      .limit(1);
    return result.length > 0;
  }

  async getClubMembers(clubId: string): Promise<any[]> {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        avatar: users.avatar,
        role: clubMembers.role,
        joinedAt: clubMembers.joinedAt,
      })
      .from(clubMembers)
      .innerJoin(users, eq(clubMembers.userId, users.id))
      .where(eq(clubMembers.clubId, clubId));
    
    return result;
  }

  async createRsvp(eventId: string, userId: string, status: string): Promise<void> {
    await db.insert(eventAttendees).values({
      eventId,
      userId,
      status,
    });
  }

  async updateRsvp(eventId: string, userId: string, status: string): Promise<void> {
    await db
      .update(eventAttendees)
      .set({ status, rsvpAt: new Date() })
      .where(and(
        eq(eventAttendees.eventId, eventId),
        eq(eventAttendees.userId, userId)
      ));
  }

  async getEventRsvps(eventId: string): Promise<any[]> {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        avatar: users.avatar,
        status: eventAttendees.status,
        rsvpAt: eventAttendees.rsvpAt,
      })
      .from(eventAttendees)
      .innerJoin(users, eq(eventAttendees.userId, users.id))
      .where(eq(eventAttendees.eventId, eventId));
    
    return result;
  }

  async getUserRsvp(eventId: string, userId: string): Promise<any | undefined> {
    const result = await db
      .select()
      .from(eventAttendees)
      .where(and(
        eq(eventAttendees.eventId, eventId),
        eq(eventAttendees.userId, userId)
      ))
      .limit(1);
    
    return result[0];
  }

  async getUserStats(userId: string): Promise<{
    attendance: number;
    avgRating: number;
    totalDinners: number;
    avgBill: number;
  }> {
    // if (!this.db) { // No need for this check if db is guaranteed to be connected.
    //   return { attendance: 0, avgRating: 0, totalDinners: 0, avgBill: 0 };
    // }

    // Get total dinners user attended
    const attendedEvents = await db
      .select()
      .from(eventAttendees)
      .where(eq(eventAttendees.userId, userId));

    const totalDinners = attendedEvents.length;

    // Get events with ratings and bills
    const eventIds = attendedEvents.map(a => a.eventId);
    
    if (eventIds.length === 0) {
      return { attendance: 100, avgRating: 0, totalDinners: 0, avgBill: 0 };
    }

    // Simple calculation for now - can be improved
    const pastEventsAttended = await db
      .select()
      .from(events)
      .where(eq(events.status, "past"));

    const ratings = pastEventsAttended.filter(e => e.rating).map(e => e.rating!);
    const bills = pastEventsAttended.filter(e => e.totalBill).map(e => e.totalBill!);

    const avgRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0;

    const avgBill = bills.length > 0 
      ? bills.reduce((a, b) => a + b, 0) / bills.length 
      : 0;

    return {
      attendance: 100, // Calculate percentage later
      avgRating: Math.round(avgRating * 10) / 10,
      totalDinners,
      avgBill: Math.round(avgBill),
    };
  }
}
