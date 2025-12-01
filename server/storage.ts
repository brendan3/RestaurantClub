import { type User, type InsertUser, type Event, type Club } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for all CRUD operations
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event methods
  getEvents(clubId?: string): Promise<Event[]>;
  getUpcomingEvents(clubId?: string): Promise<Event[]>;
  getPastEvents(clubId?: string): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  createEvent(event: any): Promise<Event>;
  
  // Club methods
  getUserClubs(userId: string): Promise<Club[]>;
  getClubById(id: string): Promise<Club | undefined>;
  
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      memberSince: new Date(),
      avatar: insertUser.avatar || null
    };
    this.users.set(id, user);
    return user;
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

  // Club methods
  async getUserClubs(): Promise<Club[]> {
    return [];
  }

  async getClubById(): Promise<Club | undefined> {
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
