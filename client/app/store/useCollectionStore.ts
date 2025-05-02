import { Record } from "./useRecordStore";
import { create } from "zustand";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export interface Collection {
  _id: string;
  name: string;
  description: string;
  records: Record[];
  likes: number;
  createdAt: string;
  updatedAt: string;
  genre: string[];
  mood: string[];
}

interface CollectionStore {
  collections: Collection[];
  currentCollection: Collection | null;
  isLoading: boolean;
  error: string | null;

  // Collection actions
  fetchCollections: (page?: number, limit?: number) => Promise<void>;
  fetchCollectionById: (collectionId: string) => Promise<void>;
  createCollection: (data: { name: string }) => Promise<Collection>;
  updateCollection: (
    collectionId: string,
    data: Partial<Collection>
  ) => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;

  // Record actions
  addRecordToCollection: (
    collectionId: string,
    recordId: string
  ) => Promise<{ success: boolean; message: string }>;
  updateRecord: (
    collectionId: string,
    recordId: string,
    data: Partial<Record>
  ) => Promise<void>;
  deleteRecord: (collectionId: string, recordId: string) => Promise<void>;

  // Social actions
  likeCollection: (collectionId: string) => Promise<void>;
  unlikeCollection: (collectionId: string) => Promise<void>;
}

export const useCollectionStore = create<CollectionStore>((set, get) => ({
  collections: [],
  currentCollection: null,
  isLoading: false,
  error: null,

  fetchCollections: async () => {
    try {
      set({ isLoading: true, error: null });
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/collections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.collections) {
        set((state) => {
          console.log("Previous state:", state);
          return { collections: data.collections };
        });
        // Verify the state was updated
      } else {
        console.error("Invalid response structure:", data);
        set({ error: data.message || "Invalid response structure" });
      }
    } catch (error) {
      console.error("Error in fetchCollections:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch collections",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCollectionById: async (collectionId) => {
    try {
      set({ isLoading: true, error: null });
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/collections/${collectionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        set({ currentCollection: data.data });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch collection",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createCollection: async (data: { name: string }): Promise<Collection> => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      console.log("Sending request with data:", { name: data.name });
      const response = await axios.post<{
        success: boolean;
        collection: Collection;
      }>(
        `${API_URL}/collections`,
        { name: data.name },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Raw response:", response);
      console.log("Response data:", response.data);

      if (!response.data.success || !response.data.collection) {
        console.error("Invalid response structure:", response.data);
        throw new Error(
          "Failed to create collection - invalid response structure"
        );
      }

      const collection = response.data.collection;
      console.log("Extracted collection:", collection);

      set((state) => ({
        collections: [...(state.collections || []), collection],
      }));

      return collection;
    } catch (error) {
      console.error("Error in createCollection:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create collection";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  updateCollection: async (collectionId, data) => {
    try {
      set({ isLoading: true, error: null });
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/collections/${collectionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        set({
          collections: get().collections.map((collection) =>
            collection._id === collectionId ? result.data : collection
          ),
          currentCollection: result.data,
        });
      } else {
        set({ error: result.message });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update collection",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCollection: async (collectionId) => {
    try {
      set({ isLoading: true, error: null });
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/collections/${collectionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        set({
          collections: get().collections.filter(
            (collection) => collection._id !== collectionId
          ),
          currentCollection: null,
        });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete collection",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addRecordToCollection: async (collectionId, recordId) => {
    try {
      console.log("Starting addRecordToCollection in store", {
        collectionId,
        recordId,
      });

      set({ isLoading: true, error: null });
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_URL}/collections/${collectionId}/records/${recordId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log("Received response in store", {
        success: result.success,
        message: result.message,
        hasCollection: !!result.collection,
      });

      if (result.success) {
        // Update both collections array and currentCollection if it exists
        set((state) => {
          const updatedCollections = state.collections.map((collection) =>
            collection._id === collectionId
              ? {
                  ...collection,
                  records: result.collection.records,
                  description: result.collection.description,
                  genre: result.collection.genre,
                  mood: result.collection.mood,
                }
              : collection
          );

          const updatedCurrentCollection =
            state.currentCollection?._id === collectionId
              ? {
                  ...state.currentCollection,
                  records: result.collection.records,
                  description: result.collection.description,
                  genre: result.collection.genre,
                  mood: result.collection.mood,
                }
              : state.currentCollection;

          console.log("Updated store state", {
            collectionsCount: updatedCollections.length,
            currentCollectionUpdated: !!updatedCurrentCollection,
          });

          return {
            collections: updatedCollections,
            currentCollection: updatedCurrentCollection,
          };
        });
        return result;
      } else {
        console.log("Failed to add record to collection", {
          message: result.message,
        });
        set({ error: result.message });
        return result;
      }
    } catch (error) {
      console.log("Error in store's addRecordToCollection", {
        error: error instanceof Error ? error.message : "Unknown error",
        collectionId,
        recordId,
      });
      set({
        error: error instanceof Error ? error.message : "Failed to add record",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateRecord: async (collectionId, recordId, data) => {
    try {
      set({ isLoading: true, error: null });
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_URL}/collections/${collectionId}/records/${recordId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();

      if (result.success) {
        const updatedRecord = result.data;
        const updateRecords = (records: Record[]) =>
          records.map((record) =>
            record._id === recordId ? updatedRecord : record
          );

        set({
          collections: get().collections.map((collection) =>
            collection._id === collectionId
              ? { ...collection, records: updateRecords(collection.records) }
              : collection
          ),
          currentCollection:
            get().currentCollection?._id === collectionId
              ? {
                  ...get().currentCollection!,
                  records: updateRecords(get().currentCollection!.records),
                }
              : get().currentCollection,
        });
      } else {
        set({ error: result.message });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update record",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteRecord: async (collectionId, recordId) => {
    try {
      set({ isLoading: true, error: null });
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_URL}/collections/${collectionId}/records/${recordId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        set({
          collections: get().collections.map((collection) =>
            collection._id === collectionId
              ? {
                  ...collection,
                  records: collection.records.filter((r) => r._id !== recordId),
                }
              : collection
          ),
          currentCollection:
            get().currentCollection?._id === collectionId
              ? {
                  ...get().currentCollection!,
                  records: get().currentCollection!.records.filter(
                    (r) => r._id !== recordId
                  ),
                }
              : get().currentCollection,
        });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete record",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  likeCollection: async (collectionId) => {
    try {
      set({ isLoading: true, error: null });
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_URL}/collections/${collectionId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        const userId = data.data.userId;
        set({
          collections: get().collections.map((collection) =>
            collection._id === collectionId
              ? { ...collection, likes: collection.likes + 1 }
              : collection
          ),
          currentCollection:
            get().currentCollection?._id === collectionId
              ? {
                  ...get().currentCollection!,
                  likes: get().currentCollection!.likes + 1,
                }
              : get().currentCollection,
        });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to like collection",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  unlikeCollection: async (collectionId) => {
    try {
      set({ isLoading: true, error: null });
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_URL}/collections/${collectionId}/unlike`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        const userId = data.data.userId;
        set({
          collections: get().collections.map((collection) =>
            collection._id === collectionId
              ? { ...collection, likes: collection.likes - 1 }
              : collection
          ),
          currentCollection:
            get().currentCollection?._id === collectionId
              ? {
                  ...get().currentCollection!,
                  likes: get().currentCollection!.likes - 1,
                }
              : get().currentCollection,
        });
      } else {
        set({ error: data.message });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to unlike collection",
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
