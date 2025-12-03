import { db, pool } from "./db";
import { users, clubs, clubMembers, events, eventAttendees, eventTags } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  if (!db) {
    console.error("❌ DATABASE_URL not set. Cannot seed database.");
    process.exit(1);
  }

  console.log("🌱 Seeding database...");

  try {
    // Hash password for all test users
    const passwordHash = await bcrypt.hash("password123", 10);

    // Create users with new schema (email, passwordHash)
    // Seed users are pre-verified so they can log in without email verification
    const [alex, sarah, mike, jessica, david] = await db.insert(users).values([
      {
        email: "alex@example.com",
        passwordHash,
        name: "Alex Chen",
        username: "alex",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        emailVerified: true,
      },
      {
        email: "sarah@example.com",
        passwordHash,
        name: "Sarah Johnson",
        username: "sarah",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        emailVerified: true,
      },
      {
        email: "mike@example.com",
        passwordHash,
        name: "Mike Rodriguez",
        username: "mike",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        emailVerified: true,
      },
      {
        email: "jessica@example.com",
        passwordHash,
        name: "Jessica Lee",
        username: "jessica",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
        emailVerified: true,
      },
      {
        email: "david@example.com",
        passwordHash,
        name: "David Kim",
        username: "david",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        emailVerified: true,
      },
    ]).returning();

    console.log("✅ Created 5 users");

    // Create a club
    const [restaurantClub] = await db.insert(clubs).values([
      {
        name: "The Restaurant Club",
        type: "private",
      },
    ]).returning();

    console.log("✅ Created club:", restaurantClub.name);

    // Add members to the club
    await db.insert(clubMembers).values([
      { clubId: restaurantClub.id, userId: alex.id, role: "owner" },
      { clubId: restaurantClub.id, userId: sarah.id, role: "admin" },
      { clubId: restaurantClub.id, userId: mike.id, role: "member" },
      { clubId: restaurantClub.id, userId: jessica.id, role: "member" },
      { clubId: restaurantClub.id, userId: david.id, role: "member" },
    ]);

    console.log("✅ Added 5 members to club");

    // Create events
    const now = new Date();
    const futureDate = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000); // 12 days from now
    const pastDate1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const pastDate2 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days ago

    const [upcomingEvent, pastEvent1, pastEvent2] = await db.insert(events).values([
      {
        clubId: restaurantClub.id,
        restaurantName: "La Trattoria",
        cuisine: "Italian",
        eventDate: futureDate,
        location: "123 Main St, New York, NY",
        status: "confirmed",
        pickerId: alex.id,
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80",
      },
      {
        clubId: restaurantClub.id,
        restaurantName: "Sushi Paradise",
        cuisine: "Japanese",
        eventDate: pastDate1,
        location: "456 Oak Ave, New York, NY",
        status: "past",
        rating: 5,
        totalBill: 180,
        pickerId: sarah.id,
        imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=1000&q=80",
      },
      {
        clubId: restaurantClub.id,
        restaurantName: "The Golden Steak",
        cuisine: "Steakhouse",
        eventDate: pastDate2,
        location: "789 Elm St, New York, NY",
        status: "past",
        rating: 4,
        totalBill: 250,
        pickerId: mike.id,
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
      },
    ]).returning();

    console.log("✅ Created 3 events (1 upcoming, 2 past)");

    // Add RSVPs for upcoming event
    await db.insert(eventAttendees).values([
      { eventId: upcomingEvent.id, userId: alex.id, status: "attending" },
      { eventId: upcomingEvent.id, userId: sarah.id, status: "attending" },
      { eventId: upcomingEvent.id, userId: mike.id, status: "maybe" },
      { eventId: upcomingEvent.id, userId: jessica.id, status: "attending" },
    ]);

    console.log("✅ Added RSVPs for upcoming event");

    // Add RSVPs for past events
    await db.insert(eventAttendees).values([
      { eventId: pastEvent1.id, userId: alex.id, status: "attending" },
      { eventId: pastEvent1.id, userId: sarah.id, status: "attending" },
      { eventId: pastEvent1.id, userId: mike.id, status: "attending" },
      { eventId: pastEvent1.id, userId: jessica.id, status: "attending" },
      { eventId: pastEvent1.id, userId: david.id, status: "declined" },
      
      { eventId: pastEvent2.id, userId: alex.id, status: "attending" },
      { eventId: pastEvent2.id, userId: sarah.id, status: "attending" },
      { eventId: pastEvent2.id, userId: mike.id, status: "attending" },
      { eventId: pastEvent2.id, userId: jessica.id, status: "attending" },
      { eventId: pastEvent2.id, userId: david.id, status: "attending" },
    ]);

    console.log("✅ Added RSVPs for past events");

    // Add tags to events
    await db.insert(eventTags).values([
      { eventId: upcomingEvent.id, tag: "Fresh" },
      { eventId: upcomingEvent.id, tag: "Romantic" },
      { eventId: pastEvent1.id, tag: "Fresh" },
      { eventId: pastEvent1.id, tag: "Expensive" },
      { eventId: pastEvent2.id, tag: "Expensive" },
      { eventId: pastEvent2.id, tag: "Quiet" },
    ]);

    console.log("✅ Added tags to events");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📝 Test Users (all with password: 'password123'):");
    console.log("   - alex@example.com (Owner)");
    console.log("   - sarah@example.com (Admin)");
    console.log("   - mike@example.com (Member)");
    console.log("   - jessica@example.com (Member)");
    console.log("   - david@example.com (Member)");
    console.log("\n🍽️  Club: The Restaurant Club");
    console.log("   - 1 upcoming event: La Trattoria (in 12 days)");
    console.log("   - 2 past events with ratings and bills");
    console.log("\n✨ You can now login with any of the test accounts!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed()
  .then(() => {
    console.log("\n✅ Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seed script failed:", error);
    process.exit(1);
  });
