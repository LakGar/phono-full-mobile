import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePreferencesStore } from "../store/usePreferencesStore";

interface Record {
  discogsId: string;
  name: string;
  artist: string;
  image: string;
  genre?: string;
  year?: number;
  style?: string[];
  format?: string[];
  country?: string;
  url?: string;
  community?: {
    have: number;
    want: number;
  };
}

export default function RecordSelectionScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Record[]>([]);
  const [popularRecords, setPopularRecords] = useState<Record[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchPopularRecords();
  }, []);

  const updatePreferences = usePreferencesStore(
    (state) => state.updatePreferences
  );

  const fetchPopularRecords = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/discogs/records/popular`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPopularRecords(data.records);
      }
    } catch (error) {
      console.error("Error fetching popular records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchRecords = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/discogs/records/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.records);
      }
    } catch (error) {
      console.error("Error searching records:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleRecord = (record: Record) => {
    setSelectedRecords((prev) => {
      if (prev.find((r) => r.discogsId === record.discogsId)) {
        return prev.filter((r) => r.discogsId !== record.discogsId);
      }
      if (prev.length >= 10) {
        Alert.alert(
          "Maximum Selection",
          "You can only select up to 10 records"
        );
        return prev;
      }
      return [...prev, record];
    });
  };

  const handleNext = async () => {
    if (selectedRecords.length < 5) {
      Alert.alert("Selection Required", "Please select at least 5 records");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }

      // Get current preferences
      const currentPreferences = usePreferencesStore.getState().preferences;

      // Convert record objects to record IDs
      const selectedRecordIds = selectedRecords
        .map((record) => record.discogsId)
        .filter((id): id is string => id !== undefined);

      // Update preferences with selected records while preserving other preferences
      await updatePreferences({
        musicPreferences: {
          ...currentPreferences.musicPreferences,
          likedRecords: selectedRecordIds,
        },
      });

      // Proceed to next screen
      router.push("/(onboarding)/collection" as const);
    } catch (error) {
      console.error("Error updating preferences:", error);
      Alert.alert("Error", "Failed to save record preferences");
    }
  };

  const renderRecordGrid = (records: Record[]) => (
    <View style={styles.grid}>
      {records.map((record) => (
        <TouchableOpacity
          key={record.discogsId}
          style={[
            styles.recordItem,
            {
              borderColor: selectedRecords.find(
                (r) => r.discogsId === record.discogsId
              )
                ? "#e54545"
                : "#333",
            },
          ]}
          onPress={() => toggleRecord(record)}
        >
          <Image
            source={{ uri: record.image }}
            style={styles.recordImage}
            defaultSource={require("../../assets/images/defaults/default-album.svg")}
          />
          <View style={styles.recordInfo}>
            <Text style={styles.recordName} numberOfLines={1}>
              {record.name}
            </Text>
            <Text style={styles.recordArtist} numberOfLines={1}>
              {record.artist}
            </Text>
            {record.year && (
              <Text style={styles.recordYear}>{record.year}</Text>
            )}
            {record.genre && (
              <Text style={styles.recordGenre}>{record.genre}</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Select Your Favorite Records</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search records..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchRecords(text);
          }}
        />
        {isSearching && (
          <ActivityIndicator style={styles.searchSpinner} color="#e54545" />
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        {searchQuery ? (
          <>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {renderRecordGrid(searchResults)}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Popular Records</Text>
            {isLoading ? (
              <ActivityIndicator color="#e54545" style={styles.loader} />
            ) : (
              renderRecordGrid(popularRecords)
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.selectionCount}>
          {selectedRecords.length} of {Math.min(selectedRecords.length, 10)}{" "}
          selected
        </Text>
        <TouchableOpacity
          style={[
            styles.finishButton,
            {
              opacity: selectedRecords.length >= 5 ? 1 : 0.5,
            },
          ]}
          onPress={handleNext}
          disabled={selectedRecords.length < 5}
        >
          <Text style={styles.finishButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginHorizontal: 20,
  },
  searchContainer: {
    margin: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
  },
  searchSpinner: {
    position: "absolute",
    right: 15,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginHorizontal: 20,
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    gap: 10,
  },
  recordItem: {
    width: "43%",
    borderRadius: 12,
    borderWidth: 2,
    overflow: "hidden",
    margin: "2.5%",
    backgroundColor: "#1a1a1a",
  },
  recordImage: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
  },
  recordInfo: {
    padding: 10,
  },
  recordName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  recordArtist: {
    color: "#999",
    fontSize: 12,
    marginTop: 2,
  },
  recordYear: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
  recordGenre: {
    color: "#999",
    fontSize: 12,
    marginTop: 2,
  },
  loader: {
    marginTop: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  selectionCount: {
    color: "#999",
    textAlign: "center",
    marginBottom: 10,
  },
  finishButton: {
    backgroundColor: "#e54545",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
