import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { API_URL } from "@/app/config/api";

interface DiscogsRecord {
  discogsId: string;
  name: string;
  artist: string;
  image: string;
  year?: string;
  genre?: string;
}

interface DiscogsResponse {
  success: boolean;
  records: DiscogsRecord[];
}

export interface SearchResult {
  id: string;
  title: string;
  cover_image?: string;
  thumb?: string;
  year?: string;
  genre?: string[];
}

export const searchDiscogs = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await axios.get<DiscogsResponse>(
      `${API_URL}/discogs/records/search`,
      {
        params: { q: query },
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
        },
      }
    );

    if (response.data.success) {
      return response.data.records.map((record) => ({
        id: record.discogsId,
        title: `${record.artist} - ${record.name}`,
        cover_image: record.image,
        year: record.year,
        genre: record.genre ? [record.genre] : [],
      }));
    }
    return [];
  } catch (error) {
    console.error("Error searching Discogs:", error);
    throw error;
  }
};
