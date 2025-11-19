import { User, MapPin, Calendar, Utensils, Star, Trophy, MessageSquare, Heart } from "lucide-react";

// Import assets
import mascotImage from "@assets/image_1763559494377.png";
import food1 from "@assets/stock_images/delicious_restaurant_89b4b1ff.jpg";
import food2 from "@assets/stock_images/delicious_restaurant_82c2ad63.jpg";
import food3 from "@assets/stock_images/delicious_restaurant_bde7cc18.jpg";
import food4 from "@assets/stock_images/delicious_restaurant_21705833.jpg";

export const CURRENT_USER = {
  id: "u1",
  name: "Alex",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  isPicker: false,
};

export const CLUB_MEMBERS = [
  { id: "u1", name: "Alex", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", status: "Eater" },
  { id: "u2", name: "Sarah", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", status: "Picker" },
  { id: "u3", name: "Mike", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", status: "Eater" },
  { id: "u4", name: "Jessica", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica", status: "Eater" },
  { id: "u5", name: "David", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David", status: "Eater" },
];

export const NEXT_EVENT = {
  id: "e1",
  restaurant: "La Trattoria",
  cuisine: "Italian",
  date: "2025-05-15T19:00:00",
  location: "123 Olive St, Downtown",
  picker: CLUB_MEMBERS[1],
  status: "confirmed", // pending, confirmed, past
  image: food1,
  attendees: ["u1", "u2", "u3", "u5"],
};

export const PAST_EVENTS = [
  {
    id: "e2",
    restaurant: "Sakura Sushi",
    cuisine: "Japanese",
    date: "2025-04-10",
    rating: 4.8,
    image: food2,
    picker: CLUB_MEMBERS[2],
    bill: 250,
    tags: ["Fresh", "Expensive", "Quiet"],
  },
  {
    id: "e3",
    restaurant: "Burger & Barrel",
    cuisine: "American",
    date: "2025-03-12",
    rating: 4.2,
    image: food3,
    picker: CLUB_MEMBERS[0],
    bill: 180,
    tags: ["Casual", "Craft Beer", "Loud"],
  },
  {
    id: "e4",
    restaurant: "El Camino",
    cuisine: "Mexican",
    date: "2025-02-14",
    rating: 4.5,
    image: food4,
    picker: CLUB_MEMBERS[3],
    bill: 200,
    tags: ["Spicy", "Margaritas", "Fun"],
  },
];

export const SOCIAL_FEED = [
  {
    id: "p1",
    user: CLUB_MEMBERS[3],
    type: "comment",
    content: "Still dreaming about that truffle pasta from La Trattoria! 🍝",
    time: "2 hours ago",
    likes: 3,
  },
  {
    id: "p2",
    user: CLUB_MEMBERS[1],
    type: "photo",
    content: "Look at this spread!",
    image: food2,
    time: "Yesterday",
    likes: 8,
  },
];

export const SUPERLATIVES = [
  { title: "The Sauce Collector", winner: "Mike", icon: Utensils },
  { title: "Most Adventurous", winner: "Sarah", icon: MapPin },
  { title: "The Photographer", winner: "Jessica", icon: Calendar },
];

export const ASSETS = {
  mascot: mascotImage,
};
