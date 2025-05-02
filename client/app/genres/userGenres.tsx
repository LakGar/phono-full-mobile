import {
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import React, { useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { usePreferencesStore } from "../store";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

const GENRES = [
  { id: 1, name: "Rock", color: "#e54545" },
  { id: 2, name: "Electronic", color: "#e54545" },
  { id: 3, name: "Pop", color: "#e54545" },
  { id: 4, name: "Hip Hop", color: "#e54545" },
  { id: 5, name: "Jazz", color: "#e54545" },
  { id: 6, name: "Classical", color: "#e54545" },
  { id: 7, name: "Blues", color: "#e54545" },
  { id: 8, name: "Folk", color: "#e54545" },
  { id: 9, name: "R&B", color: "#e54545" },
  { id: 10, name: "Country", color: "#e54545" },
  { id: 11, name: "Reggae", color: "#e54545" },
  { id: 12, name: "Latin", color: "#e54545" },
  { id: 13, name: "Soul", color: "#e54545" },
  { id: 14, name: "Funk", color: "#e54545" },
  { id: 15, name: "Metal", color: "#e54545" },
];

const userGenres = () => {
  const { preferences, updatePreferences } = usePreferencesStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    preferences.musicPreferences.likedGenres || []
  );
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleAddGenre = async (genre: string) => {
    if (selectedGenres.includes(genre)) return;
    if (selectedGenres.length >= 10) {
      Toast.show({
        type: "error",
        text1: "Maximum Selection",
        text2: "You can only select up to 10 genres",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      const newSelectedGenres = [...selectedGenres, genre];
      setSelectedGenres(newSelectedGenres);
      updatePreferences({
        ...preferences,
        musicPreferences: {
          ...preferences.musicPreferences,
          likedGenres: newSelectedGenres,
        },
      });
      Toast.show({
        type: "success",
        text1: `${genre} added`,
      });
    } catch (error) {
      console.error("Error adding genre:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to add genre. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveGenre = async (genre: string) => {
    if (selectedGenres.length <= 5) {
      Toast.show({
        type: "error",
        text1: "Minimum Selection",
        text2: "You must have at least 5 genres selected",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      const newSelectedGenres = selectedGenres.filter((g) => g !== genre);
      setSelectedGenres(newSelectedGenres);
      updatePreferences({
        ...preferences,
        musicPreferences: {
          ...preferences.musicPreferences,
          likedGenres: newSelectedGenres,
        },
      });
      Toast.show({
        type: "success",
        text1: "Genre Removed",
        text2: `${genre} has been removed from your preferences`,
      });
    } catch (error) {
      console.error("Error removing genre:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to remove genre. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGenres = GENRES.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#e54545", "#000000", "#000000", "#1a1a1a"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.3, 0.5, 1]}
        style={styles.container}
      >
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol name="arrow.left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Your Genres</Text>
        </Animated.View>

        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search genres..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Selected Genres</Text>
            <Text style={styles.selectionCount}>
              {selectedGenres.length} of 10 selected
            </Text>
            <View style={styles.genreGrid}>
              {selectedGenres.map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={[styles.genreChip, styles.selectedChip]}
                  onPress={() => handleRemoveGenre(genre)}
                >
                  <Text style={styles.genreText}>{genre}</Text>
                  <IconSymbol name="xmark" size={16} color="white" />
                </TouchableOpacity>
              ))}
              {selectedGenres.length === 0 && (
                <Text style={styles.emptyText}>
                  No genres selected. Add some below!
                </Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Genres</Text>
            <View style={styles.genreGrid}>
              {filteredGenres.map((genre) => (
                <TouchableOpacity
                  key={genre.id}
                  style={[
                    styles.genreChip,
                    selectedGenres.includes(genre.name) && styles.selectedChip,
                  ]}
                  onPress={() =>
                    selectedGenres.includes(genre.name)
                      ? handleRemoveGenre(genre.name)
                      : handleAddGenre(genre.name)
                  }
                >
                  <Text
                    style={[
                      styles.genreText,
                      selectedGenres.includes(genre.name) &&
                        styles.selectedText,
                    ]}
                  >
                    {genre.name}
                  </Text>
                  {selectedGenres.includes(genre.name) && (
                    <IconSymbol
                      name="checkmark"
                      size={16}
                      color="white"
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#e54545" />
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    color: "white",
    marginLeft: 10,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  selectionCount: {
    color: "#999",
    fontSize: 14,
    marginBottom: 15,
  },
  genreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  genreChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  selectedChip: {
    backgroundColor: "#e54545",
    borderColor: "#e54545",
  },
  genreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  selectedText: {
    color: "#fff",
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default userGenres;
