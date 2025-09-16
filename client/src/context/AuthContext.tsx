import React, { createContext, useContext, useMemo, useCallback, ReactNode } from "react";
import { useUser, useAuth as useClerkAuth, useClerk } from "@clerk/clerk-react";
import { User } from "@shared/schema";

type ClerkUser = Omit<User, 'password'> & {
  isSeller?: boolean;
  businessName?: string;
  businessDescription?: string;
};

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
    user: clerkUser ? {
      id: parseInt(clerkUser.id),
      username: clerkUser.username || clerkUser.emailAddresses[0].emailAddress,
      email: clerkUser.emailAddresses[0].emailAddress,
      // Ensure strict boolean for isSeller
      isSeller: Boolean((clerkUser.publicMetadata as any)?.isSeller),
      businessName: (clerkUser.publicMetadata as any)?.businessName,
      businessDescription: (clerkUser.publicMetadata as any)?.businessDescription,
      // Optional: expose raw metadata for debugging in Profile
      // @ts-ignore
      _rawPublicMetadata: clerkUser.publicMetadata,
    } : null,
    isAuthenticated: !!clerkAuth.isSignedIn,
    logout,
    loading: !isLoaded,
    getToken,
  }), [clerkUser, clerkAuth.isSignedIn, isLoaded, logout, getToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};