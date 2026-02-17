import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, isAuthenticated, type User } from "./api";
import { setAuthExpiredCallback, setAuthToken } from "@/config";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  setUser: (user: User | null) => void;
  setGuest: (isGuest: boolean) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthExpired = () => {
    setUser(null);
    setAuthToken(null);
    // Only show toast and clear guest flag if not already in guest mode (guests have no token; don't kick them out)
    setIsGuest((currentGuest) => {
      if (!currentGuest) {
        toast.error("Your session has expired. Please log in again.");
        return false;
      }
      return true; // Keep guest mode
    });
  };

  const refreshUser = async () => {
    if (!isAuthenticated()) {
      setUser(null);
      setIsGuest(false);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setIsGuest(false); // Clear guest mode when authenticated
    } catch (error: any) {
      console.error("Failed to fetch user:", error);
      setUser(null);
      setIsGuest(false);
      // Don't show toast here - the apiRequest already handles 401
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth expiration callback
    setAuthExpiredCallback(handleAuthExpired);
    refreshUser();
  }, []);

  const setGuestMode = (guest: boolean) => {
    setIsGuest(guest);
    if (guest) {
      setUser(null);
      setAuthToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isGuest,
        setUser,
        setGuest: setGuestMode,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

