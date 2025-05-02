import { create } from "zustand";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NotificationPreferences {
  newFollowers: boolean;
  newComments: boolean;
  newLikes: boolean;
  collectionUpdates: boolean;
  recommendations: boolean;
}

interface DisplayPreferences {
  gridView: boolean;
  showRecordDetails: boolean;
  showCollectionStats: boolean;
  defaultSortBy: "title" | "artist" | "releaseYear" | "dateAdded";
  defaultSortOrder: "asc" | "desc";
}

interface ThemePreferences {
  darkMode: boolean;
  primaryColor: string;
  accentColor: string;
  fontSize: "small" | "medium" | "large";
}

interface Preferences {
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  theme: ThemePreferences;
  language: string;
  musicPreferences: {
    likedGenres: string[];
    dislikedGenres: string[];
    likedArtists: string[];
    dislikedArtists: string[];
    likedRecords: string[];
    dislikedRecords: string[];
  };
}

interface PreferencesStore {
  preferences: Preferences;
  isLoading: boolean;
  error: string | null;

  // Preference actions
  fetchPreferences: () => Promise<void>;
  updatePreferences: (data: Partial<Preferences>) => Promise<void>;

  // Theme actions
  toggleDarkMode: () => Promise<void>;
  updateTheme: (theme: Partial<ThemePreferences>) => Promise<void>;

  // Notification actions
  updateNotificationSettings: (
    settings: Partial<NotificationPreferences>
  ) => Promise<void>;

  // Display actions
  updateDisplaySettings: (
    settings: Partial<DisplayPreferences>
  ) => Promise<void>;
  toggleGridView: () => Promise<void>;

  // Language action
  setLanguage: (language: string) => Promise<void>;

  // Record actions
  toggleRecordLike: (recordId: string) => Promise<void>;
  isRecordLiked: (recordId: string) => boolean;
}

const defaultPreferences: Preferences = {
  notifications: {
    newFollowers: true,
    newComments: true,
    newLikes: true,
    collectionUpdates: true,
    recommendations: true,
  },
  display: {
    gridView: true,
    showRecordDetails: true,
    showCollectionStats: true,
    defaultSortBy: "dateAdded",
    defaultSortOrder: "desc",
  },
  theme: {
    darkMode: true,
    primaryColor: "#e54545",
    accentColor: "#666666",
    fontSize: "medium",
  },
  language: "en",
  musicPreferences: {
    likedGenres: [],
    dislikedGenres: [],
    likedArtists: [],
    dislikedArtists: [],
    likedRecords: [],
    dislikedRecords: [],
  },
};

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
  preferences: defaultPreferences,
  isLoading: false,
  error: null,

  fetchPreferences: async () => {
    try {
      set({ isLoading: true, error: null });
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        set({ error: "No authentication token found" });
        return;
      }

      const response = await fetch(`${API_URL}/preferences`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        set({ preferences: { ...defaultPreferences, ...data.data } });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({ error: "Failed to fetch preferences" });
    } finally {
      set({ isLoading: false });
    }
  },

  updatePreferences: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        set({ error: "No authentication token found" });
        return;
      }

      const response = await fetch(`${API_URL}/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        set({ preferences: { ...get().preferences, ...result.data } });
      } else {
        set({ error: result.message });
      }
    } catch (error) {
      set({ error: "Failed to update preferences" });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleDarkMode: async () => {
    const currentTheme = get().preferences.theme;
    const newTheme = { ...currentTheme, darkMode: !currentTheme.darkMode };

    try {
      await get().updatePreferences({ theme: newTheme });
    } catch (error) {
      set({ error: "Failed to toggle dark mode" });
    }
  },

  updateTheme: async (theme) => {
    const currentTheme = get().preferences.theme;
    const newTheme = { ...currentTheme, ...theme };

    try {
      await get().updatePreferences({ theme: newTheme });
    } catch (error) {
      set({ error: "Failed to update theme" });
    }
  },

  updateNotificationSettings: async (settings) => {
    const currentNotifications = get().preferences.notifications;
    const newNotifications = { ...currentNotifications, ...settings };

    try {
      await get().updatePreferences({ notifications: newNotifications });
    } catch (error) {
      set({ error: "Failed to update notification settings" });
    }
  },

  updateDisplaySettings: async (settings) => {
    const currentDisplay = get().preferences.display;
    const newDisplay = { ...currentDisplay, ...settings };

    try {
      await get().updatePreferences({ display: newDisplay });
    } catch (error) {
      set({ error: "Failed to update display settings" });
    }
  },

  toggleGridView: async () => {
    const currentDisplay = get().preferences.display;
    const newDisplay = {
      ...currentDisplay,
      gridView: !currentDisplay.gridView,
    };

    try {
      await get().updatePreferences({ display: newDisplay });
    } catch (error) {
      set({ error: "Failed to toggle grid view" });
    }
  },

  setLanguage: async (language) => {
    try {
      await get().updatePreferences({ language });
    } catch (error) {
      set({ error: "Failed to set language" });
    }
  },

  toggleRecordLike: async (recordId: string) => {
    try {
      set({ isLoading: true, error: null });
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        set({ error: "No authentication token found" });
        return;
      }

      const currentPreferences = get().preferences;
      const isLiked =
        currentPreferences.musicPreferences.likedRecords.includes(recordId);

      const updatedLikedRecords = isLiked
        ? currentPreferences.musicPreferences.likedRecords.filter(
            (id) => id !== recordId
          )
        : [...currentPreferences.musicPreferences.likedRecords, recordId];

      const response = await fetch(`${API_URL}/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          musicPreferences: {
            ...currentPreferences.musicPreferences,
            likedRecords: updatedLikedRecords,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        set({
          preferences: {
            ...currentPreferences,
            musicPreferences: {
              ...currentPreferences.musicPreferences,
              likedRecords: updatedLikedRecords,
            },
          },
        });
      } else {
        set({ error: result.message });
      }
    } catch (error) {
      set({ error: "Failed to update record like status" });
    } finally {
      set({ isLoading: false });
    }
  },

  isRecordLiked: (recordId: string) => {
    const currentPreferences = get().preferences;
    return currentPreferences.musicPreferences.likedRecords.includes(recordId);
  },
}));
