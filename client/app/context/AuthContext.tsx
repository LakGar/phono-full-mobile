import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { router } from "expo-router";

interface User {
  id: string;
  email: string;
  name: string;
  exp?: number; // JWT expiration timestamp
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      if (!mounted) return;

      console.log("Checking authentication...");
      try {
        const token = await AsyncStorage.getItem("token");
        console.log("Token found:", !!token);

        if (token) {
          try {
            const decoded = jwtDecode<User>(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp && decoded.exp < currentTime) {
              console.log("Token expired");
              await AsyncStorage.removeItem("token");
              if (mounted) {
                setIsAuthenticated(false);
                setUser(null);
              }
            } else {
              console.log("Valid token found, setting user");
              if (mounted) {
                setUser(decoded);
                setIsAuthenticated(true);
              }
            }
          } catch (decodeError) {
            console.error("Token decode failed:", decodeError);
            await AsyncStorage.removeItem("token");
            if (mounted) {
              setIsAuthenticated(false);
              setUser(null);
            }
          }
        } else {
          console.log("No token found");
          if (mounted) {
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        if (mounted) {
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (mounted) {
          console.log("Auth check complete. isAuthenticated:", isAuthenticated);
          setInitialized(true);
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (token: string) => {
    console.log("Logging in...");
    try {
      await AsyncStorage.setItem("token", token);
      const decoded = jwtDecode<User>(token);
      setUser(decoded);
      setIsAuthenticated(true);
      setInitialized(true);
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login failed:", error);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    console.log("Logging out...");
    try {
      await AsyncStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
      setInitialized(true);
      router.replace("/(auth)");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    isLoading: isLoading || !initialized,
    user,
    login,
    logout,
  };

  console.log("AuthContext current state:", {
    isAuthenticated,
    isLoading: isLoading || !initialized,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { useAuth, AuthProvider };
export default AuthProvider;
