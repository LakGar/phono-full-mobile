import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
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

interface GenreSection {
  title: string;
  description: string;
  color: string;
  genre: string;
}

const GENRE_COLORS: Record<string, string> = {
  Jazz: "#e5e545",
  "Hip Hop": "#45e545",
  Rock: "#e54545",
  Electronic: "#45e5e5",
  Classical: "#4545e5",
  Blues: "#e58245",
  Soul: "#8245e5",
  Funk: "#4582e5",
  Pop: "#e545e5",
  "R&B": "#8245e5",
  Folk: "#45e582",
  Country: "#e5a245",
  Reggae: "#45a2e5",
  Latin: "#e54582",
  Metal: "#e58282",
};

const getGenreSection = (genre: string): GenreSection => {
  const defaultColor = "#e54545";
  return {
    genre,
    title: `${genre} Collection`,
    description: `Discover the best of ${genre}`,
    color: GENRE_COLORS[genre] || defaultColor,
  };
};

const GenreSection = ({
  section,
  albums,
}: {
  section: GenreSection;
  albums: Album[];
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle]}>{section.title}</Text>
        <Text style={styles.sectionDescription}>{section.description}</Text>
      </View>
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
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const GenreSections = () => {
  const [genreAlbums, setGenreAlbums] = useState<Record<string, Album[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const preferences = usePreferencesStore((state) => state.preferences);
  const likedGenres = preferences?.musicPreferences?.likedGenres || [];

  useEffect(() => {
    const fetchAlbumsForGenres = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        if (likedGenres.length === 0) {
          console.log("No liked genres found");
          setIsLoading(false);
          return;
        }

        const fetchPromises = likedGenres.map(async (genre) => {
          const section = getGenreSection(genre);
          const url = `${API_URL}/discogs/albums/by-genres?genres=${encodeURIComponent(
            genre
          )}`;

          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              const processedAlbums = data.albums.map((album: any) => {
                const [artist, ...titleParts] = album.title.split(" - ");
                const title = titleParts.join(" - ");
                return {
                  ...album,
                  artist: artist.trim(),
                  title: title.trim(),
                };
              });
              return { genre, albums: processedAlbums };
            }
          }
          console.log(`No albums found for ${genre}`);
          return { genre, albums: [] };
        });

        const results = await Promise.all(fetchPromises);
        const albumsByGenre = results.reduce((acc, { genre, albums }) => {
          acc[genre] = albums;
          return acc;
        }, {} as Record<string, Album[]>);

        setGenreAlbums(albumsByGenre);
      } catch (error) {
        console.error("Error fetching albums:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbumsForGenres();
  }, [likedGenres]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e54545" />
      </View>
    );
  }

  if (likedGenres.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No genres selected yet</Text>
      </View>
    );
  }

  // Filter out genres with no albums
  const genresWithAlbums = likedGenres.filter(
    (genre) => genreAlbums[genre]?.length > 0
  );

  if (genresWithAlbums.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No albums found for your genres</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {genresWithAlbums.map((genre) => {
        const section = getGenreSection(genre);
        return (
          <GenreSection
            key={genre}
            section={section}
            albums={genreAlbums[genre] || []}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#fff",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#999",
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 15,
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
});

export default GenreSections;
