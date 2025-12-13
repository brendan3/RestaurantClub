import {
  type User,
  type InsertUser,
  type Event,
  type Club,
  type WishlistRestaurant,
  type EventPhoto,
  type DatePoll,
  type DatePollOption,
  type DatePollWithOptions,
} from "@shared/schema";
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
  deleteEvent(id: string): Promise<void>;
  updateEvent(id: string, updates: {
    restaurantName?: string;
    cuisine?: string;
    eventDate?: Date;
    location?: string;
    notes?: string;
    maxSeats?: number;
    imageUrl?: string;
    placeId?: string | null;
    placePhotoName?: string | null;
    rating?: number | null;
    totalBill?: number | null;
    status?: string;
  }): Promise<Event>;
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
  updateClub(clubId: string, updates: { name?: string; type?: string }): Promise<Club>;
  updateUserProfile(userId: string, data: { name?: string; avatar?: string | null }): Promise<User>;
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

  // Wishlist methods
  getWishlistForUser(userId: string): Promise<WishlistRestaurant[]>;
  addWishlistRestaurant(input: {
    userId: string;
    name: string;
    address?: string | null;
    cuisine?: string | null;
    placeId?: string | null;
    imageUrl?: string | null;
  }): Promise<WishlistRestaurant>;
  removeWishlistRestaurant(id: string, userId: string): Promise<void>;

  // Event photo methods
  getEventPhotos(eventId: string): Promise<EventPhoto[]>;
  addEventPhoto(input: {
    eventId: string;
    userId: string;
    imageUrl: string;
    caption?: string | null;
    order?: number | null;
  }): Promise<EventPhoto>;
  deleteEventPhoto(photoId: string, userId: string): Promise<void>;

  // Date poll methods
  getActiveDatePollByClub(clubId: string, userId: string): Promise<DatePollWithOptions | null>;
  createDatePoll(input: {
    clubId: string;
    createdById: string;
    title: string;
    restaurantName?: string | null;
    optionDates: Date[]; // 3–5 choices
    closesAt: Date;
  }): Promise<DatePollWithOptions>;
  saveDatePollVotes(pollId: string, userId: string, optionIds: string[]): Promise<void>;
  closeDatePoll(pollId: string, userId: string): Promise<DatePollWithOptions>;
  getDatePollById(pollId: string): Promise<DatePoll | undefined>;
  getDatePollOptions(pollId: string): Promise<DatePollOption[]>;
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

  async deleteEvent(): Promise<void> {
    throw new Error("Not implemented");
  }

  async updateEvent(
    id: string,
    _updates: {
      restaurantName?: string;
      cuisine?: string;
      eventDate?: Date;
      location?: string;
      notes?: string;
      maxSeats?: number;
      imageUrl?: string;
      placeId?: string | null;
      placePhotoName?: string | null;
      rating?: number | null;
      totalBill?: number | null;
      status?: string;
    }
  ): Promise<Event> {
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

  async updateClub(
    _clubId: string,
    _updates: { name?: string; type?: string }
  ): Promise<Club> {
    throw new Error("Not implemented");
  }

  async addClubMember(
    _clubId: string,
    _userId: string,
    _role: string = "member"
  ): Promise<void> {
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

  async updateUserProfile(
    _userId: string,
    _data: { name?: string; avatar?: string | null }
  ): Promise<User> {
    throw new Error("Not implemented");
  }

  // Wishlist methods
  async getWishlistForUser(): Promise<WishlistRestaurant[]> {
    return [];
  }

  async addWishlistRestaurant(): Promise<WishlistRestaurant> {
    throw new Error("Not implemented");
  }

  async removeWishlistRestaurant(): Promise<void> {
    throw new Error("Not implemented");
  }

  // Event photo methods
  async getEventPhotos(): Promise<EventPhoto[]> {
    return [];
  }

  async addEventPhoto(): Promise<EventPhoto> {
    throw new Error("Not implemented in MemStorage");
  }

  async deleteEventPhoto(): Promise<void> {
    throw new Error("Not implemented in MemStorage");
  }

  // Date poll methods
  async getActiveDatePollByClub(): Promise<DatePollWithOptions | null> {
    throw new Error("Not implemented");
  }

  async createDatePoll(): Promise<DatePollWithOptions> {
    throw new Error("Not implemented");
  }

  async saveDatePollVotes(): Promise<void> {
    throw new Error("Not implemented");
  }

  async closeDatePoll(): Promise<DatePollWithOptions> {
    throw new Error("Not implemented");
  }

  async getDatePollById(): Promise<DatePoll | undefined> {
    return undefined;
  }

  async getDatePollOptions(): Promise<DatePollOption[]> {
    return [];
  }
}

// Use database storage if DATABASE_URL is set, otherwise use in-memory
import { DatabaseStorage } from "./dbStorage";

export const storage: IStorage = process.env.DATABASE_URL 
  ? new DatabaseStorage()
  : new MemStorage();
