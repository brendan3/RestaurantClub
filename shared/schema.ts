import { sql } from "drizzle-orm";
import { pgEnum, pgTable, text, varchar, timestamp, integer, boolean, uniqueIndex } from "drizzle-orm/pg-core";
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
  emailVerified: boolean("email_verified").default(false),
  verificationToken: text("verification_token"),
  verificationExpires: timestamp("verification_expires"),
  memberSince: timestamp("member_since").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clubs table
export const clubs = pgTable("clubs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'private' | 'public'
  joinCode: varchar("join_code", { length: 16 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Helper to generate a random join code (6 uppercase letters/digits)
export function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid confusing chars like 0/O, 1/I
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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
  notes: text("notes"), // Event description/notes
  maxSeats: integer("max_seats"), // Optional max attendees
  status: text("status").notNull(), // 'pending' | 'confirmed' | 'past'
  rating: integer("rating"),
  totalBill: integer("total_bill"),
  pickerId: varchar("picker_id").notNull().references(() => users.id),
  imageUrl: text("image_url"),
  // Google Places integration
  placeId: varchar("place_id", { length: 255 }), // Google Places ID
  placePhotoName: varchar("place_photo_name", { length: 512 }), // Google Places photo reference
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

// Event photos (recap gallery)
export const eventPhotos = pgTable("event_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(), // Cloudinary secure_url
  caption: text("caption"),
  order: integer("order"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wishlist restaurants (user-scoped)
export const wishlistRestaurants = pgTable("wishlist_restaurants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }),
  cuisine: varchar("cuisine", { length: 100 }),
  placeId: varchar("place_id", { length: 100 }), // Google Places ID if available
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// DATE POLLS (LIGHTWEIGHT PLANNING)
// ============================================

export const datePollStatusEnum = pgEnum("date_poll_status", ["open", "closed"]);

export const datePolls = pgTable("date_polls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clubId: varchar("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  restaurantName: text("restaurant_name"),
  status: datePollStatusEnum("status").notNull().default("open"),
  closesAt: timestamp("closes_at", { withTimezone: true }).notNull().default(sql`now() + interval '24 hours'`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const datePollOptions = pgTable("date_poll_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => datePolls.id, { onDelete: "cascade" }),
  optionDate: timestamp("option_date", { withTimezone: true }).notNull(),
  order: integer("order"),
});

export const datePollVotes = pgTable(
  "date_poll_votes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    pollId: varchar("poll_id").notNull().references(() => datePolls.id, { onDelete: "cascade" }),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    optionId: varchar("option_id").notNull().references(() => datePollOptions.id, { onDelete: "cascade" }),
    canAttend: boolean("can_attend").notNull().default(true),
  },
  (t) => ({
    uniq: uniqueIndex("date_poll_votes_unique").on(t.pollId, t.userId, t.optionId),
  })
);

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

export type EventPhoto = typeof eventPhotos.$inferSelect;
export type InsertEventPhoto = typeof eventPhotos.$inferInsert;

export type WishlistRestaurant = typeof wishlistRestaurants.$inferSelect;

export type DatePoll = typeof datePolls.$inferSelect;
export type DatePollOption = typeof datePollOptions.$inferSelect;
export type DatePollVote = typeof datePollVotes.$inferSelect;

export type DatePollWithOptions = {
  poll: DatePoll;
  options: DatePollOption[];
};

// ============================================
// NOTIFICATIONS
// ============================================

export const notificationTypeEnum = pgEnum("notification_type", [
  "event_created",
  "poll_started",
  "photos_added",
]);

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  eventId: varchar("event_id").references(() => events.id, { onDelete: "cascade" }),
  pollId: varchar("poll_id").references(() => datePolls.id, { onDelete: "cascade" }),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
});

export type Notification = typeof notifications.$inferSelect;

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
