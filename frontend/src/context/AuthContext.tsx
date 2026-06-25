"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../config/firebase";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  isMock: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<UserProfile>;
  signup: (email: string, password: string, name: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (name: string, photoURL: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync auth state
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${firebaseUser.uid}`,
            emailVerified: firebaseUser.emailVerified,
            isMock: false,
            createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Mock Auth State Sync
      const stored = localStorage.getItem("planora_current_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    setError(null);
    try {
      if (isFirebaseConfigured && auth) {
        const credentials = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = credentials.user;
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || "",
          displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${fbUser.uid}`,
          emailVerified: fbUser.emailVerified,
          isMock: false,
          createdAt: fbUser.metadata.creationTime || new Date().toISOString()
        };
        setUser(profile);
        setLoading(false);
        return profile;
      } else {
        // Mock Login
        const mockUsersRaw = localStorage.getItem("planora_users") || "[]";
        const mockUsers = JSON.parse(mockUsersRaw) as UserProfile[];
        // Find or auto-create a mock user to make testing frictionless!
        let existing = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!existing) {
          // If password is too short in mock, simulate a small restriction
          if (password.length < 6) {
            throw new Error("Password must be at least 6 characters.");
          }
          existing = {
            uid: `mock_${Math.random().toString(36).substring(2, 9)}`,
            email: email.toLowerCase(),
            displayName: email.split("@")[0],
            photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
            emailVerified: true,
            isMock: true,
            createdAt: new Date().toISOString()
          };
          mockUsers.push(existing);
          localStorage.setItem("planora_users", JSON.stringify(mockUsers));
        }
        
        localStorage.setItem("planora_current_user", JSON.stringify(existing));
        setUser(existing);
        setLoading(false);
        return existing;
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err.message || "Failed to log in";
      setError(msg);
      throw new Error(msg);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<UserProfile> => {
    setLoading(true);
    setError(null);
    try {
      if (isFirebaseConfigured && auth) {
        const credentials = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = credentials.user;
        await firebaseUpdateProfile(fbUser, { displayName: name });
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || "",
          displayName: name,
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${fbUser.uid}`,
          emailVerified: fbUser.emailVerified,
          isMock: false,
          createdAt: fbUser.metadata.creationTime || new Date().toISOString()
        };
        setUser(profile);
        setLoading(false);
        return profile;
      } else {
        // Mock Signup
        const mockUsersRaw = localStorage.getItem("planora_users") || "[]";
        const mockUsers = JSON.parse(mockUsersRaw) as UserProfile[];
        const exists = mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          throw new Error("Email address already in use.");
        }

        const newUser: UserProfile = {
          uid: `mock_${Math.random().toString(36).substring(2, 9)}`,
          email: email.toLowerCase(),
          displayName: name,
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
          emailVerified: true,
          isMock: true,
          createdAt: new Date().toISOString()
        };

        mockUsers.push(newUser);
        localStorage.setItem("planora_users", JSON.stringify(mockUsers));
        localStorage.setItem("planora_current_user", JSON.stringify(newUser));
        setUser(newUser);
        setLoading(false);
        return newUser;
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err.message || "Failed to sign up";
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      } else {
        localStorage.removeItem("planora_current_user");
      }
      setUser(null);
    } catch (err: any) {
      setError(err.message || "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setError(null);
    try {
      if (isFirebaseConfigured && auth) {
        await sendPasswordResetEmail(auth, email);
      } else {
        // Mock password reset
        console.log(`Mock reset password email sent to ${email}`);
      }
    } catch (err: any) {
      const msg = err.message || "Failed to send reset link";
      setError(msg);
      throw new Error(msg);
    }
  };

  const updateProfile = async (name: string, photoURL: string): Promise<void> => {
    if (!user) throw new Error("No authenticated user active.");
    setLoading(true);
    setError(null);
    try {
      if (isFirebaseConfigured && auth && auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: name,
          photoURL: photoURL
        });
        setUser(prev => prev ? { ...prev, displayName: name, photoURL } : null);
      } else {
        // Mock update profile
        const updated = { ...user, displayName: name, photoURL };
        localStorage.setItem("planora_current_user", JSON.stringify(updated));
        
        // Update in mock_users list
        const mockUsersRaw = localStorage.getItem("planora_users") || "[]";
        const mockUsers = JSON.parse(mockUsersRaw) as UserProfile[];
        const updatedList = mockUsers.map(u => u.uid === user.uid ? updated : u);
        localStorage.setItem("planora_users", JSON.stringify(updatedList));
        
        setUser(updated);
      }
    } catch (err: any) {
      const msg = err.message || "Failed to update profile";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        resetPassword,
        updateProfile,
        clearError
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
