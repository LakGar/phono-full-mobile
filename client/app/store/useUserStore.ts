import { create } from "zustand";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Collection {
  _id: string;
  name: string;
  coverImage?: string;
  records?: any[];
}

interface WishlistItem {
  _id: string;
  discogsId: string;
  title: string;
  artist: string;
  coverImage?: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  followers: string[];
  following: string[];
  posts: string[];
  collections: Collection[];
  wishlist: WishlistItem[];
  recommendations: string[];
  isVerified: boolean;
  isActive: boolean;
  lastLogin: Date;
}

interface UserStore {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  // Profile actions
  fetchProfile: (token: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>, token: string) => Promise<void>;

  // Wishlist actions
  addToWishlist: (recordData: any, token: string) => Promise<void>;
  removeFromWishlist: (recordData: any, token: string) => Promise<void>;

  // Follow actions
  followUser: (userId: string, token: string) => Promise<void>;
  unfollowUser: (userId: string, token: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async (token) => {
    try {
      set({ isLoading: true, error: null });

      if (!token) {
        set({ error: "No authentication token found" });
        return;
      }

      console.log("Fetching profile with token");
      const response = await fetch(`${API_URL}/users/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Profile response status:", response.status);
      const data = await response.json();
      console.log("Profile response data:", data);

      if (data.success) {
        set({ profile: data.data });
      } else {
        set({ error: data.message || "Failed to fetch profile" });
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      set({ error: "Failed to fetch profile. Please check your connection." });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data, token) => {
    try {
      set({ isLoading: true, error: null });

      if (!token) {
        set({ error: "No authentication token found" });
        return;
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        set({ profile: result.data });
      } else {
        set({ error: result.message });
      }
    } catch (error) {
      set({ error: "Failed to update profile" });
    } finally {
      set({ isLoading: false });
    }
  },

  addToWishlist: async (recordData, token) => {
    try {
      set({ isLoading: true, error: null });

      if (!token) {
        set({ error: "No authentication token found" });
        return;
      }

      const response = await fetch(`${API_URL}/users/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recordData }),
      });
      const data = await response.json();

      if (data.success && get().profile) {
        set({
          profile: {
            ...get().profile!,
            wishlist: [...get().profile!.wishlist, data.collectionId],
          },
        });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({ error: "Failed to add to wishlist" });
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromWishlist: async (recordData, token) => {
    try {
      set({ isLoading: true, error: null });

      if (!token) {
        set({ error: "No authentication token found" });
        return;
      }

      const response = await fetch(`${API_URL}/users/wishlist`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recordData }),
      });
      const data = await response.json();

      if (data.success && get().profile) {
        set({
          profile: {
            ...get().profile!,
            wishlist: get().profile!.wishlist.filter(
              (id) => id !== data.collectionId
            ),
          },
        });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({ error: "Failed to remove from wishlist" });
    } finally {
      set({ isLoading: false });
    }
  },

  followUser: async (userId, token) => {
    try {
      set({ isLoading: true, error: null });

      if (!token) {
        set({ error: "No authentication token found" });
        return;
      }

      const response = await fetch(`${API_URL}/users/follow/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success && get().profile) {
        set({
          profile: {
            ...get().profile!,
            following: [...get().profile!.following, userId],
          },
        });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({ error: "Failed to follow user" });
    } finally {
      set({ isLoading: false });
    }
  },

  unfollowUser: async (userId, token) => {
    try {
      set({ isLoading: true, error: null });

      if (!token) {
        set({ error: "No authentication token found" });
        return;
      }

      const response = await fetch(`${API_URL}/users/unfollow/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success && get().profile) {
        set({
          profile: {
            ...get().profile!,
            following: get().profile!.following.filter((id) => id !== userId),
          },
        });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({ error: "Failed to unfollow user" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
