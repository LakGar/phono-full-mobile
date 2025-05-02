import { create } from "zustand";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Record {
  _id: string;
  name: string;
  description: string;
  image: string | null;
  artist: string;
  mood: string | null;
  genre: string | null;
  year: number | null;
  discogsId: string;
  collections: string[];
  createdAt: string;
  updatedAt: string;
}

interface RecordStore {
  records: Record[];
  loading: boolean;
  error: string | null;
  fetchRecords: (discogsId: string) => Promise<void>;
  addRecord: (
    record: Omit<Record, "_id" | "collections" | "createdAt" | "updatedAt">
  ) => Promise<void>;
}

export const useRecordStore = create<RecordStore>((set) => ({
  records: [],
  loading: false,
  error: null,

  fetchRecords: async (recordId) => {
    set({ loading: true, error: null });
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        set({ error: "No authentication token found", loading: false });
        return;
      }

      const response = await fetch(`${API_URL}/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recordId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch records");
      }

      const data = await response.json();
      if (data.success) {
        set({ records: data.records, loading: false });
      } else {
        set({ error: data.message, loading: false });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while fetching records",
        loading: false,
      });
    }
  },

  addRecord: async (record) => {
    set({ loading: true, error: null });
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        set({ error: "No authentication token found", loading: false });
        return;
      }

      const response = await fetch(`${API_URL}/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(record),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          throw new Error(errorData.errors.join(", "));
        }
        throw new Error(errorData.message || "Failed to add record");
      }

      const data = await response.json();
      if (data.success) {
        set((state) => ({
          records: [...state.records, data.record],
          loading: false,
        }));
      } else {
        set({ error: data.message, loading: false });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while adding record",
        loading: false,
      });
    }
  },
}));
