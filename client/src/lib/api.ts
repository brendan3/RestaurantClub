/**
 * API Service Layer
 * 
 * This module provides functions to fetch data from the backend API.
 * Import these instead of mockData to use real API data.
 * 
 * Usage:
 *   import { getEvents, getCurrentUser } from "@/lib/api";
 *   const events = await getEvents();
 */

import { apiRequest, setAuthToken, getAuthToken } from "@/config";

// Types (will be moved to shared schema later)
export interface Event {
  id: string;
  clubId: string;
  restaurantName: string;
  cuisine: string;
  eventDate: string;
  location?: string | null;
  notes?: string | null;
  maxSeats?: number | null;
  status: "pending" | "confirmed" | "past";
  rating?: number | null;
  totalBill?: number | null;
  pickerId: string;
  imageUrl?: string | null;
  createdAt?: string;
  // Legacy fields for backward compatibility with mock data
  restaurant?: string;
  date?: string;
  bill?: number;
  tags?: string[];
  attendees?: string[];
  picker?: {
    id: string;
    name: string;
    avatar: string;
  };
  image?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  memberSince: string;
  stats?: {
    attendance: number;
    avgRating: number;
    totalDinners: number;
    avgBill: number;
  };
}

export interface Club {
  id: string;
  name: string;
  members: number;
  membersList: Array<{
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  }>;
  type: "private" | "public";
  joinCode?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SignupResponse {
  needsVerification: true;
  verifyUrl: string;
  message: string;
}

export interface VerifyEmailResponse {
  verified: boolean;
  message: string;
}

export interface ResendVerificationResponse {
  message: string;
  verifyUrl?: string; // DEV only
}

// ============================================
// AUTH FUNCTIONS
// ============================================

/**
 * Sign up a new user
 * Returns verification info instead of logging in
 */
export async function signup(email: string, password: string, name: string): Promise<SignupResponse> {
  const response = await apiRequest<SignupResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  
  // Don't store token - user needs to verify email first
  return response;
}

/**
 * Log in an existing user
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  
  // Store the token
  setAuthToken(response.token);
  
  return response;
}

/**
 * Log out the current user
 */
export async function logout(): Promise<void> {
  await apiRequest<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
  
  // Clear the token
  setAuthToken(null);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  return apiRequest<VerifyEmailResponse>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

/**
 * Resend verification email
 */
export async function resendVerification(email: string): Promise<ResendVerificationResponse> {
  return apiRequest<ResendVerificationResponse>("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ============================================
// USER FUNCTIONS
// ============================================

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/api/user/me");
}

// ============================================
// CLUB FUNCTIONS
// ============================================

/**
 * Get user's clubs
 */
export async function getUserClubs(): Promise<Club[]> {
  return apiRequest<Club[]>("/api/clubs/me");
}

/**
 * Create a new club
 */
export async function createClub(name: string, type: "private" | "public" = "private"): Promise<Club> {
  return apiRequest<Club>("/api/clubs", {
    method: "POST",
    body: JSON.stringify({ name, type }),
  });
}

/**
 * Get club by ID
 */
export async function getClubById(id: string): Promise<Club> {
  return apiRequest<Club>(`/api/clubs/${id}`);
}

/**
 * Join a club with a joinCode
 */
export async function joinClub(joinCode: string): Promise<{ message: string; club: { id: string; name: string } }> {
  return apiRequest<{ message: string; club: { id: string; name: string } }>("/api/clubs/join", {
    method: "POST",
    body: JSON.stringify({ joinCode }),
  });
}

// ============================================
// EVENT FUNCTIONS
// ============================================

/**
 * Get all events
 */
export async function getEvents(): Promise<Event[]> {
  return apiRequest<Event[]>("/api/events");
}

/**
 * Get upcoming events only
 */
export async function getUpcomingEvents(): Promise<Event[]> {
  return apiRequest<Event[]>("/api/events/upcoming");
}

/**
 * Get past events only
 */
export async function getPastEvents(): Promise<Event[]> {
  return apiRequest<Event[]>("/api/events/past");
}

/**
 * Get event by ID
 */
export async function getEventById(id: string): Promise<Event> {
  return apiRequest<Event>(`/api/events/${id}`);
}

/**
 * Create a new event
 */
export async function createEvent(eventData: {
  restaurantName: string;
  cuisine: string;
  eventDate: string;
  location?: string;
  notes?: string;
  maxSeats?: number;
  imageUrl?: string;
}): Promise<Event> {
  return apiRequest<Event>("/api/events", {
    method: "POST",
    body: JSON.stringify(eventData),
  });
}

/**
 * Update an existing event
 */
export async function updateEvent(eventId: string, eventData: {
  notes?: string;
  location?: string;
  maxSeats?: number;
}): Promise<Event> {
  return apiRequest<Event>(`/api/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(eventData),
  });
}

// ============================================
// RSVP FUNCTIONS
// ============================================

/**
 * Create or update RSVP for an event
 */
export async function rsvpToEvent(
  eventId: string, 
  status: "attending" | "declined" | "maybe"
): Promise<{ message: string; status: string }> {
  return apiRequest<{ message: string; status: string }>(`/api/events/${eventId}/rsvp`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

/**
 * Get all RSVPs for an event
 */
export async function getEventRsvps(eventId: string): Promise<any[]> {
  return apiRequest<any[]>(`/api/events/${eventId}/rsvps`);
}

/**
 * Get current user's RSVP for an event
 */
export async function getUserRsvp(eventId: string): Promise<any | null> {
  return apiRequest<any | null>(`/api/events/${eventId}/rsvp/me`);
}

// ============================================
// WISHLIST FUNCTIONS
// ============================================

export interface WishlistRestaurant {
  id: string;
  userId: string;
  name: string;
  address?: string | null;
  cuisine?: string | null;
  placeId?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
}

/**
 * Get user's wishlist
 */
export async function getWishlist(): Promise<WishlistRestaurant[]> {
  return apiRequest<WishlistRestaurant[]>("/api/wishlist");
}

/**
 * Add a restaurant to wishlist
 */
export async function addToWishlist(payload: {
  name: string;
  address?: string | null;
  cuisine?: string | null;
  placeId?: string | null;
  imageUrl?: string | null;
}): Promise<WishlistRestaurant> {
  return apiRequest<WishlistRestaurant>("/api/wishlist", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Remove a restaurant from wishlist
 */
export async function removeFromWishlist(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/wishlist/${id}`, {
    method: "DELETE",
  });
}

// ============================================
// SOCIAL FEED FUNCTIONS
// ============================================

export interface SocialFeedItem {
  id: string;
  clubId: string;
  clubName: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  attendingCount: number;
  maxSeats: number | null;
  location: string | null;
  cuisine: string;
}

export interface SocialFeedResponse {
  items: SocialFeedItem[];
}

/**
 * Get social feed (events from user's clubs)
 */
export async function getSocialFeed(): Promise<SocialFeedResponse> {
  return apiRequest<SocialFeedResponse>("/api/social/feed");
}

// ============================================
// NEARBY RESTAURANTS FUNCTIONS
// ============================================

export interface NearbyPlace {
  id: string;
  name: string;
  address: string;
  primaryType?: string;
  lat: number;
  lng: number;
  rating?: number;
  priceLevel?: string;
  googleMapsUrl?: string;
}

export interface NearbyRestaurantsResponse {
  places: NearbyPlace[];
}

/**
 * Search nearby restaurants using Google Places API (New)
 */
export async function searchNearbyRestaurants(
  lat: number, 
  lng: number, 
  query?: string
): Promise<NearbyRestaurantsResponse> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
  });
  if (query) {
    params.set("query", query);
  }
  return apiRequest<NearbyRestaurantsResponse>(`/api/restaurants/nearby?${params.toString()}`);
}

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Health check
 */
export async function healthCheck(): Promise<{ ok: boolean; timestamp: string }> {
  return apiRequest<{ ok: boolean; timestamp: string }>("/api/health");
}
