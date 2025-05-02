import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { usePreferencesStore } from "@/app/store/usePreferencesStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Preset genres from Discogs
const GENRES = [
  { id: 1, name: "Rock", color: "#e54545" },
  { id: 2, name: "Electronic", color: "#45e5e5" },
  { id: 3, name: "Pop", color: "#e545e5" },
  { id: 4, name: "Hip Hop", color: "#45e545" },
  { id: 5, name: "Jazz", color: "#e5e545" },
  { id: 6, name: "Classical", color: "#4545e5" },
  { id: 7, name: "Blues", color: "#e58245" },
  { id: 8, name: "Folk", color: "#45e582" },
  { id: 9, name: "R&B", color: "#8245e5" },
  { id: 10, name: "Country", color: "#e5a245" },
  { id: 11, name: "Reggae", color: "#45a2e5" },
  { id: 12, name: "Latin", color: "#e54582" },
  { id: 13, name: "Soul", color: "#82e545" },
  { id: 14, name: "Funk", color: "#4582e5" },
  { id: 15, name: "Metal", color: "#e58282" },
];

export default function GenreSelectionScreen() {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const updatePreferences = usePreferencesStore(
    (state) => state.updatePreferences
  );

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((id) => id !== genreId);
      }
      if (prev.length >= 10) {
        Alert.alert("Maximum Selection", "You can only select up to 10 genres");
        return prev;
      }
      return [...prev, genreId];
    });
  };

  const handleNext = async () => {
    if (selectedGenres.length < 5) {
      Alert.alert("Selection Required", "Please select at least 5 genres");
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

      // Convert genre IDs to genre names
      const selectedGenreNames = selectedGenres
        .map((id) => GENRES.find((genre) => genre.id === id)?.name)
        .filter((name): name is string => name !== undefined);

      // Update preferences with selected genres while preserving other preferences
      await updatePreferences({
        musicPreferences: {
          ...currentPreferences.musicPreferences,
          likedGenres: selectedGenreNames,
        },
      });

      // Proceed to next screen
      router.push("/(onboarding)/artists" as const);
    } catch (error) {
      console.error("Error updating preferences:", error);
      Alert.alert("Error", "Failed to save genre preferences");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Select Your Favorite Genres</Text>

      <Text style={styles.subtitle}>
        Choose 5-10 genres that match your music taste
      </Text>

      <ScrollView style={styles.scrollView}>
        <View style={styles.grid}>
          {GENRES.map((genre) => (
            <TouchableOpacity
              key={genre.id}
              style={[
                styles.genreItem,
                {
                  backgroundColor: selectedGenres.includes(genre.id)
                    ? genre.color
                    : "#1a1a1a",
                },
              ]}
              onPress={() => toggleGenre(genre.id)}
            >
              <Text
                style={[
                  styles.genreText,
                  {
                    color: selectedGenres.includes(genre.id) ? "#000" : "#fff",
                  },
                ]}
              >
                {genre.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.selectionCount}>
          {selectedGenres.length} of 10 selected
        </Text>
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              opacity: selectedGenres.length >= 5 ? 1 : 0.5,
            },
          ]}
          onPress={handleNext}
          disabled={selectedGenres.length < 5}
        >
          <Text style={styles.nextButtonText}>Next</Text>
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
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    gap: 10,
  },
  genreItem: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    margin: "1.5%",
    padding: 10,
    paddingHorizontal: 20,
  },
  genreText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
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
  nextButton: {
    backgroundColor: "#e54545",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
