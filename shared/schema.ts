import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  username: text("username"), // Optional display name
  avatar: text("avatar"),
  memberSince: timestamp("member_since").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clubs table
export const clubs = pgTable("clubs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'private' | 'public'
  createdAt: timestamp("created_at").defaultNow(),
});

// Club members (many-to-many)
export const clubMembers = pgTable("club_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clubId: varchar("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").default("member"), // 'owner' | 'admin' | 'member'
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Events/Dinners table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clubId: varchar("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
  restaurantName: text("restaurant_name").notNull(),
  cuisine: text("cuisine").notNull(),
  eventDate: timestamp("event_date").notNull(),
  location: text("location"),
  status: text("status").notNull(), // 'pending' | 'confirmed' | 'past'
  rating: integer("rating"),
  totalBill: integer("total_bill"),
  pickerId: varchar("picker_id").notNull().references(() => users.id),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event attendees (many-to-many)
export const eventAttendees = pgTable("event_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").default("attending"), // 'attending' | 'declined' | 'maybe'
  rsvpAt: timestamp("rsvp_at").defaultNow(),
});

// Event tags
export const eventTags = pgTable("event_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  tag: text("tag").notNull(), // 'Fresh', 'Expensive', 'Quiet', etc.
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  passwordHash: true,
  name: true,
  username: true,
  avatar: true,
});

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const insertClubSchema = createInsertSchema(clubs).pick({
  name: true,
  type: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClub = z.infer<typeof insertClubSchema>;
export type Club = typeof clubs.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
