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
  Image,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUserStore } from "../store/useUserStore";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { usePreferencesStore } from "../store";

const { width } = Dimensions.get("window");

const userArtist = () => {
  const { profile } = useUserStore();
  const { preferences } = usePreferencesStore();
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      console.log(preferences.musicPreferences.likedArtists);
      const token = await AsyncStorage.getItem("token");
      for (const artist of preferences.musicPreferences.likedArtists) {
        const response = await fetch(
          `${API_URL}/discogs/artists/details/${artist}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setArtists((prev) => [...prev, data.artist]);
        }
      }
    } catch (error) {
      console.error("Error fetching artists:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load artists. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#e54545", "#000000", "#000000", "#1a1a1a"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.3, 0.5, 1]}
        style={styles.container}
      >
        <Animated.View style={[styles.header]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol name="arrow.left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Your Artists</Text>
        </Animated.View>

        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search artists..."
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
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#e54545" />
            </View>
          ) : filteredArtists.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="person.2" size={48} color="#666" />
              <Text style={styles.emptyText}>No artists found</Text>
              <Text style={styles.emptySubtext}>
                Follow artists to see them here
              </Text>
            </View>
          ) : (
            <View style={styles.artistsContainer}>
              {filteredArtists.map((artist) => (
                <TouchableOpacity
                  key={artist.id}
                  style={styles.artistItem}
                  onPress={() => router.push(`/artist/${artist.id}` as any)}
                >
                  <Image
                    source={{ uri: artist.images[0].uri }}
                    style={styles.artistImage}
                  />
                  <View style={styles.artistInfo}>
                    <Text style={styles.artistName} numberOfLines={1}>
                      {artist.name}
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={16} color="#999" />
                  <View style={styles.break}></View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#666",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  artistsContainer: {
    padding: 20,
  },
  artistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  artistImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },
  artistInfo: {
    flex: 1,
    marginLeft: 15,
  },
  artistName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  break: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 60,
    height: 1,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  followButton: {
    backgroundColor: "#e54545",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#666",
  },
  followButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  followingButtonText: {
    color: "#666",
  },
});

export default userArtist;
