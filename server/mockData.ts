// Mock data for initial API development
// This will be replaced with real database queries later

export const mockEvents = [
  {
    id: "e1",
    restaurant: "La Trattoria",
    cuisine: "Italian",
    date: "2025-05-15T19:00:00",
    location: "123 Olive St, Downtown",
    status: "confirmed",
    attendees: ["u1", "u2", "u3", "u5"],
    picker: {
      id: "u2",
      name: "Sarah",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    }
  },
  {
    id: "e2",
    restaurant: "Sakura Sushi",
    cuisine: "Japanese",
    date: "2025-04-10T18:30:00",
    location: "456 Sushi Lane",
    status: "past",
    rating: 4.8,
    bill: 250,
    tags: ["Fresh", "Expensive", "Quiet"],
    attendees: ["u1", "u2", "u4", "u5"],
    picker: {
      id: "u3",
      name: "Mike",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"
    }
  },
  {
    id: "e3",
    restaurant: "Burger & Barrel",
    cuisine: "American",
    date: "2025-03-12T19:00:00",
    location: "789 Burger Blvd",
    status: "past",
    rating: 4.2,
    bill: 180,
    tags: ["Casual", "Craft Beer", "Loud"],
    attendees: ["u1", "u2", "u3", "u4"],
    picker: {
      id: "u1",
      name: "Alex",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
    }
  }
];

export const mockUser = {
  id: "u1",
  name: "Alex",
  username: "alex",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  memberSince: "2024-01-01",
  stats: {
    attendance: 100,
    avgRating: 4.8,
    totalDinners: 14,
    avgBill: 45
  },
  badges: [
    {
      id: "b1",
      name: "Golden Fork 2024",
      description: "Tried the most new dishes",
      icon: "trophy"
    }
  ]
};

export const mockClubs = [
  {
    id: "c1",
    name: "Downtown Foodies",
    members: 5,
    membersList: [
      { id: "u1", name: "Alex", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
      { id: "u2", name: "Sarah", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
      { id: "u3", name: "Mike", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
      { id: "u4", name: "Jessica", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica" },
      { id: "u5", name: "David", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" }
    ],
    type: "private",
    createdAt: "2024-01-15"
  }
];

