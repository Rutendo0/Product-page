import React, { createContext, useContext, useMemo, useCallback, ReactNode } from "react";
import { useUser, useAuth as useClerkAuth, useClerk } from "@clerk/clerk-react";
import { User } from "@shared/schema";

type ClerkUser = Omit<User, 'password' | 'id'> & { id: string };

type AuthContextType = {
  user: ClerkUser | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  loading: boolean;
  getToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const clerkAuth = useClerkAuth();
  const { user: clerkUser, isLoaded } = useUser();
  // Normalize Clerk user shape for our app
  const normalizedUser = useMemo(() => {
    if (!clerkUser) return null;
    return {
      id: clerkUser.id,
      username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || "",
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
    } as ClerkUser;
  }, [clerkUser]);

  const logout = useCallback(async () => {
    await clerkAuth.signOut();
  }, [clerkAuth]);

  const getToken = useCallback(async () => {
    if (!clerkAuth.isSignedIn) return null;
    try {
      return await clerkAuth.getToken();
    } catch (error) {
      console.error("Failed to get token:", error);
      return null;
    }
  }, [clerkAuth]);

  const value = useMemo(() => ({
    user: normalizedUser,
    isAuthenticated: !!clerkAuth.isSignedIn,
    logout,
    loading: !isLoaded,
    getToken,
  }), [normalizedUser, clerkAuth.isSignedIn, isLoaded, logout, getToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};