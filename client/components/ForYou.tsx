import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from "react-native";
import { API_URL } from "../app/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePreferencesStore } from "../app/store/usePreferencesStore";
import { router } from "expo-router";

interface Album {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  year: number;
  genre: string;
}

const LoadingSkeleton = () => {
  const pulseAnim = new Animated.Value(0);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonContainer}>
      {[...Array(5)].map((_, index) => (
        <Animated.View key={index} style={[styles.skeletonItem, { opacity }]} />
      ))}
    </View>
  );
};

const ForYou = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const preferences = usePreferencesStore((state) => state.preferences);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        console.log("Starting to fetch albums...");
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        // Always use the popular albums endpoint since genres endpoint is not available
        const url = `${API_URL}/discogs/albums/popular`;
        console.log("Making request to:", url);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        if (data.success) {
          // Process albums to split artist and title
          const processedAlbums = data.albums.map((album: any) => {
            const [artist, ...titleParts] = album.title.split(" - ");
            const title = titleParts.join(" - ");
            return {
              ...album,
              artist: artist.trim(),
              title: title.trim(),
            };
          });
          setAlbums(processedAlbums);
        } else {
          console.error("API returned unsuccessful response:", data);
        }
      } catch (error) {
        console.error("Error in fetchAlbums:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, []); // Remove preferences dependency since we're not using it

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {albums.map((album) => (
          <TouchableOpacity
            key={album.id}
            style={styles.albumCard}
            onPress={() => router.push(`/record/${album.id}` as any)}
          >
            <Image
              source={{ uri: album.coverImage }}
              style={styles.albumCover}
              defaultSource={require("../assets/images/defaults/default-album.png")}
            />
            <Text style={styles.albumTitle} numberOfLines={1}>
              {album.title}
            </Text>
            <Text style={styles.albumArtist} numberOfLines={1}>
              {album.artist}
            </Text>
            <Text style={styles.albumGenre} numberOfLines={1}>
              {album.genre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default ForYou;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },

  scrollContent: {
    gap: 15,
    paddingHorizontal: 20,
  },
  albumCard: {
    width: 150,
    marginRight: 15,
  },
  albumCover: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  albumTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  albumArtist: {
    color: "#999",
    fontSize: 12,
  },
  albumGenre: {
    color: "#666",
    fontSize: 10,
    marginTop: 2,
  },
  skeletonContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  skeletonItem: {
    width: 150,
    height: 150,
    backgroundColor: "#333",
    borderRadius: 8,
    marginRight: 15,
  },
});
