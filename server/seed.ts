import { getDb } from "./db";
import { users, clubs, clubMembers, events, eventAttendees, eventTags } from "@shared/schema";

async function seed() {
  const db = getDb();
  
  if (!db) {
    console.error("❌ DATABASE_URL not set. Cannot seed database.");
    process.exit(1);
  }

  console.log("🌱 Seeding database...");

  try {
    // Create users
    const [alex, sarah, mike, jessica, david] = await db.insert(users).values([
      {
        username: "alex",
        password: "password123", // In production, this should be hashed!
        name: "Alex",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      },
      {
        username: "sarah",
        password: "password123",
        name: "Sarah",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      },
      {
        username: "mike",
        password: "password123",
        name: "Mike",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      },
      {
        username: "jessica",
        password: "password123",
        name: "Jessica",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
      },
      {
        username: "david",
        password: "password123",
        name: "David",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      },
    ]).returning();

    console.log("✅ Created 5 users");

    // Create a club
    const [club] = await db.insert(clubs).values({
      name: "Downtown Foodies",
      type: "private",
    }).returning();

    console.log("✅ Created club:", club.name);

    // Add members to club
    await db.insert(clubMembers).values([
      { clubId: club.id, userId: alex.id, role: "owner" },
      { clubId: club.id, userId: sarah.id, role: "member" },
      { clubId: club.id, userId: mike.id, role: "member" },
      { clubId: club.id, userId: jessica.id, role: "member" },
      { clubId: club.id, userId: david.id, role: "member" },
    ]);

    console.log("✅ Added 5 members to club");

    // Create events
    const upcomingEvent = await db.insert(events).values({
      clubId: club.id,
      restaurantName: "La Trattoria",
      cuisine: "Italian",
      eventDate: new Date("2025-05-15T19:00:00"),
      location: "123 Olive St, Downtown",
      status: "confirmed",
      pickerId: sarah.id,
    }).returning();

    const pastEvent1 = await db.insert(events).values({
      clubId: club.id,
      restaurantName: "Sakura Sushi",
      cuisine: "Japanese",
      eventDate: new Date("2025-04-10T18:30:00"),
      location: "456 Sushi Lane",
      status: "past",
      rating: 5,
      totalBill: 250,
      pickerId: mike.id,
    }).returning();

    const pastEvent2 = await db.insert(events).values({
      clubId: club.id,
      restaurantName: "Burger & Barrel",
      cuisine: "American",
      eventDate: new Date("2025-03-12T19:00:00"),
      location: "789 Burger Blvd",
      status: "past",
      rating: 4,
      totalBill: 180,
      pickerId: alex.id,
    }).returning();

    console.log("✅ Created 3 events");

    // Add attendees to upcoming event
    await db.insert(eventAttendees).values([
      { eventId: upcomingEvent[0].id, userId: alex.id },
      { eventId: upcomingEvent[0].id, userId: sarah.id },
      { eventId: upcomingEvent[0].id, userId: mike.id },
      { eventId: upcomingEvent[0].id, userId: david.id },
    ]);

    // Add attendees to past events
    await db.insert(eventAttendees).values([
      { eventId: pastEvent1[0].id, userId: alex.id },
      { eventId: pastEvent1[0].id, userId: sarah.id },
      { eventId: pastEvent1[0].id, userId: jessica.id },
      { eventId: pastEvent1[0].id, userId: david.id },
      { eventId: pastEvent2[0].id, userId: alex.id },
      { eventId: pastEvent2[0].id, userId: sarah.id },
      { eventId: pastEvent2[0].id, userId: mike.id },
      { eventId: pastEvent2[0].id, userId: jessica.id },
    ]);

    console.log("✅ Added attendees to events");

    // Add tags to past events
    await db.insert(eventTags).values([
      { eventId: pastEvent1[0].id, tag: "Fresh" },
      { eventId: pastEvent1[0].id, tag: "Expensive" },
      { eventId: pastEvent1[0].id, tag: "Quiet" },
      { eventId: pastEvent2[0].id, tag: "Casual" },
      { eventId: pastEvent2[0].id, tag: "Craft Beer" },
      { eventId: pastEvent2[0].id, tag: "Loud" },
    ]);

    console.log("✅ Added tags to events");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\nTest user credentials:");
    console.log("  Username: alex");
    console.log("  Password: password123");
    
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();

