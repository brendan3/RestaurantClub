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

import { apiRequest } from "@/config";

// Types (will be moved to shared schema later)
export interface Event {
  id: string;
  restaurant: string;
  cuisine: string;
  date: string;
  location?: string;
  status: "pending" | "confirmed" | "past";
  rating?: number;
  bill?: number;
  tags?: string[];
  attendees: string[];
  picker: {
    id: string;
    name: string;
    avatar: string;
  };
  image?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  memberSince: string;
  stats: {
    attendance: number;
    avgRating: number;
    totalDinners: number;
    avgBill: number;
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;
}

export interface Club {
  id: string;
  name: string;
  members: number;
  membersList: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
  type: "private" | "public";
  createdAt: string;
}

// API Functions

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
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/api/user/me");
}

/**
 * Get user's clubs
 */
export async function getClubs(): Promise<Club[]> {
  return apiRequest<Club[]>("/api/clubs");
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ ok: boolean; timestamp: string }> {
  return apiRequest<{ ok: boolean; timestamp: string }>("/api/health");
}

