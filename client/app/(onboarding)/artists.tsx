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
  Animated,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePreferencesStore } from "@/app/store/usePreferencesStore";

interface Artist {
  id: string;
  name: string;
  image: string;
}

export default function ArtistSelectionScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [popularArtists, setPopularArtists] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    fetchPopularArtists();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const updatePreferences = usePreferencesStore(
    (state) => state.updatePreferences
  );

  const fetchPopularArtists = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/discogs/artists/popular`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        const artistsWithImages = data.artists
          .filter(
            (artist: Artist) => artist.image && artist.image.trim() !== ""
          )
          .slice(0, 20);
        setPopularArtists(artistsWithImages);
      }
    } catch (error) {
      console.error("Error fetching popular artists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchArtists = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/discogs/artists/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        const artistsWithImages = data.artists
          .filter(
            (artist: Artist) => artist.image && artist.image.trim() !== ""
          )
          .slice(0, 20);
        setSearchResults(artistsWithImages);
      }
    } catch (error) {
      console.error("Error searching artists:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleArtist = (artist: Artist) => {
    setSelectedArtists((prev) => {
      if (prev.find((a) => a.id === artist.id)) {
        return prev.filter((a) => a.id !== artist.id);
      }
      if (prev.length >= 10) {
        Alert.alert(
          "Maximum Selection",
          "You can only select up to 10 artists"
        );
        return prev;
      }
      return [...prev, artist];
    });
  };

  const handleNext = async () => {
    if (selectedArtists.length < 5) {
      Alert.alert("Selection Required", "Please select at least 5 artists");
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

      // Convert artist objects to artist IDs
      const selectedArtistIds = selectedArtists
        .map((artist) => artist.id)
        .filter((id): id is string => id !== undefined);

      // Update preferences with selected artists while preserving other preferences
      await updatePreferences({
        musicPreferences: {
          ...currentPreferences.musicPreferences,
          likedArtists: selectedArtistIds,
        },
      });

      // Proceed to next screen
      router.push("/(onboarding)/records" as const);
    } catch (error) {
      console.error("Error updating preferences:", error);
      Alert.alert("Error", "Failed to save artist preferences");
    }
  };

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => new Set([...prev, id]));
  };

  const handleImageError = (id: string) => {
    // Remove artist from results if image fails to load
    setSearchResults((prev) => prev.filter((artist) => artist.id !== id));
    setPopularArtists((prev) => prev.filter((artist) => artist.id !== id));
  };

  const renderArtistGrid = (artists: Artist[]) => (
    <View style={styles.grid}>
      {artists.map((artist) => (
        <View key={artist.id} style={styles.artistContainer}>
          {!loadedImages.has(artist.id) && (
            <Animated.View
              style={[
                styles.loadingBlock,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim,
                },
              ]}
            >
              <ActivityIndicator size="small" color="#e54545" />
            </Animated.View>
          )}
          <TouchableOpacity
            style={[
              styles.artistItem,
              {
                borderColor: selectedArtists.find((a) => a.id === artist.id)
                  ? "#e54545"
                  : "#333",
              },
            ]}
            onPress={() => toggleArtist(artist)}
          >
            <Image
              source={{ uri: artist.image }}
              style={styles.artistImage}
              onLoad={() => handleImageLoad(artist.id)}
              onError={() => handleImageError(artist.id)}
            />
            <Text style={styles.artistName} numberOfLines={2}>
              {artist.name}
            </Text>
          </TouchableOpacity>
        </View>
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
      <Text style={styles.title}>Select Your Favorite Artists</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search artists..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchArtists(text);
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
            {renderArtistGrid(searchResults)}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Popular Artists</Text>
            {isLoading ? (
              <ActivityIndicator color="#e54545" style={styles.loader} />
            ) : (
              renderArtistGrid(popularArtists)
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.selectionCount}>
          {selectedArtists.length} of 10 selected
        </Text>
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              opacity: selectedArtists.length >= 5 ? 1 : 0.5,
            },
          ]}
          onPress={handleNext}
          disabled={selectedArtists.length < 5}
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
  artistItem: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    overflow: "hidden",
    margin: "1.5%",
    backgroundColor: "#1a1a1a",
  },
  artistImage: {
    width: "100%",
    height: "70%",
    resizeMode: "cover",
  },
  artistName: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    padding: 5,
    height: "30%",
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
  artistContainer: {
    width: "45%",
    aspectRatio: 1,
    margin: "1.5%",
  },
  loadingBlock: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
