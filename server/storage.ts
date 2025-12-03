import { type User, type InsertUser, type Event, type Club } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for all CRUD operations
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserVerification(userId: string, data: {
    emailVerified?: boolean;
    verificationToken?: string | null;
    verificationExpires?: Date | null;
  }): Promise<User>;
  
  // Event methods
  getEvents(clubId?: string): Promise<Event[]>;
  getUpcomingEvents(clubId?: string): Promise<Event[]>;
  getPastEvents(clubId?: string): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  createEvent(event: any): Promise<Event>;
  updateEvent(id: string, updates: { notes?: string; location?: string; maxSeats?: number }): Promise<Event>;
  createRsvp(eventId: string, userId: string, status: string): Promise<void>;
  updateRsvp(eventId: string, userId: string, status: string): Promise<void>;
  getEventRsvps(eventId: string): Promise<any[]>;
  getUserRsvp(eventId: string, userId: string): Promise<any | undefined>;
  
  // Club methods
  getUserClubs(userId: string): Promise<Club[]>;
  getClubById(id: string): Promise<Club | undefined>;
  getClubByJoinCode(joinCode: string): Promise<Club | undefined>;
  createClub(club: any): Promise<Club>;
  updateClubJoinCode(clubId: string, joinCode: string): Promise<void>;
  addClubMember(clubId: string, userId: string, role?: string): Promise<void>;
  isUserInClub(userId: string, clubId: string): Promise<boolean>;
  getClubMembers(clubId: string): Promise<any[]>;
  
  // Stats methods
  getUserStats(userId: string): Promise<{
    attendance: number;
    avgRating: number;
    totalDinners: number;
    avgBill: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      memberSince: new Date(),
      username: insertUser.username ?? null,
      avatar: insertUser.avatar || null,
      emailVerified: false,
      verificationToken: null,
      verificationExpires: null,
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserVerification(userId: string, data: {
    emailVerified?: boolean;
    verificationToken?: string | null;
    verificationExpires?: Date | null;
  }): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Event methods - will be replaced with DB queries
  async getEvents(): Promise<Event[]> {
    return [];
  }

  async getUpcomingEvents(): Promise<Event[]> {
    return [];
  }

  async getPastEvents(): Promise<Event[]> {
    return [];
  }

  async getEventById(): Promise<Event | undefined> {
    return undefined;
  }

  async createEvent(): Promise<Event> {
    throw new Error("Not implemented");
  }

  async updateEvent(): Promise<Event> {
    throw new Error("Not implemented");
  }

  // Club methods
  async getUserClubs(): Promise<Club[]> {
    return [];
  }

  async getClubById(): Promise<Club | undefined> {
    return undefined;
  }

  async getClubByJoinCode(): Promise<Club | undefined> {
    return undefined;
  }

  async createClub(): Promise<Club> {
    throw new Error("Not implemented");
  }

  async updateClubJoinCode(): Promise<void> {
    throw new Error("Not implemented");
  }

  async addClubMember(): Promise<void> {
    throw new Error("Not implemented");
  }

  async isUserInClub(): Promise<boolean> {
    return false;
  }

  async getClubMembers(): Promise<any[]> {
    return [];
  }

  // RSVP methods
  async createRsvp(): Promise<void> {
    throw new Error("Not implemented");
  }

  async updateRsvp(): Promise<void> {
    throw new Error("Not implemented");
  }

  async getEventRsvps(): Promise<any[]> {
    return [];
  }

  async getUserRsvp(): Promise<any | undefined> {
    return undefined;
  }

  // Stats methods
  async getUserStats(): Promise<any> {
    return {
      attendance: 100,
      avgRating: 4.8,
      totalDinners: 14,
      avgBill: 45
    };
  }
}

// Use database storage if DATABASE_URL is set, otherwise use in-memory
import { DatabaseStorage } from "./dbStorage";

export const storage: IStorage = process.env.DATABASE_URL 
  ? new DatabaseStorage()
  : new MemStorage();
