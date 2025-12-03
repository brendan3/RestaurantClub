import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, isAuthenticated, type User } from "./api";
import { setAuthExpiredCallback, setAuthToken } from "@/config";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthExpired = () => {
    setUser(null);
    setAuthToken(null);
    toast.error("Your session has expired. Please log in again.");
    // Redirect to login - will happen automatically via ProtectedRoute
  };

  const refreshUser = async () => {
    if (!isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error: any) {
      console.error("Failed to fetch user:", error);
      setUser(null);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        setUser,
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

