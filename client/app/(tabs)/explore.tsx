import {
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  FlatList,
  NativeScrollEvent,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import CollapsibleHeader from "@/components/ui/CollapsibleHeader";
import Header from "@/components/ui/Header";
import { useUserStore } from "../store/useUserStore";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.4;
const ARTIST_CARD_WIDTH = width * 0.3;

const userExplore = () => {
  const [featuredCollections, setFeaturedCollections] = useState<any[]>([]);
  const [editorPicks, setEditorPicks] = useState<any[]>([]);
  const [genreHighlights, setGenreHighlights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsHeaderVisible(offsetY > 30);
  };

  const { profile } = useUserStore();
  useEffect(() => {
    fetchExploreData();
  }, []);

  const fetchExploreData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const [featuredRes, editorRes, genreRes] = await Promise.all([
        fetch(`${API_URL}/discogs/explore/featured`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/discogs/albums/editor-picks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/discogs/explore/genre-highlights`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const [featuredData, editorData, genreData] = await Promise.all([
        featuredRes.json(),
        editorRes.json(),
        genreRes.json(),
      ]);

      console.log("Featured Collections Response:", {
        success: featuredData.success,
        collections: featuredData.collections,
      });

      if (featuredData.success) {
        console.log("Setting featured collections:", featuredData.collections);
        const trendingArtists = featuredData.collections.find(
          (collection) => collection.title === "Trending Artists"
        );
        console.log("Trending Artists Data:", trendingArtists);
        setFeaturedCollections(featuredData.collections);
      }
      if (editorData.success) {
        console.log("Setting editor picks:", editorData.picks);
        setEditorPicks(editorData.picks);
      }
      if (genreData.success) {
        console.log("Setting genre highlights:", genreData.highlights);
        setGenreHighlights(genreData.highlights);
      }
    } catch (error) {
      console.error("Error fetching explore data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load explore data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFeaturedCollection = ({ item }: { item: any }) => {
    console.log("Rendering featured collection item:", item);

    // Skip items with placeholder images
    if (item.image && item.image.includes("spacer.gif")) {
      return null;
    }

    // Check if item has artist-specific properties
    if (item.name && item.image) {
      return (
        <TouchableOpacity
          style={styles.artistCard}
          onPress={() => router.push(`/artist/${item.id}` as any)}
        >
          <Image source={{ uri: item.image }} style={styles.artistImage} />
          <Text style={styles.artistName} numberOfLines={1}>
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    }

    // Skip albums with placeholder images
    if (item.coverImage && item.coverImage.includes("spacer.gif")) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.albumCard}
        onPress={() => router.push(`/record/${item.id}` as any)}
      >
        <Image source={{ uri: item.coverImage }} style={styles.albumImage} />
        <Text style={styles.albumTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.albumArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEditorPick = ({ item }: { item: any }) => {
    const title = item.title.split(" - ")[1] || item.title;
    return (
      <TouchableOpacity
        style={styles.editorPickCard}
        onPress={() => router.push(`/record/${item.id}`)}
      >
        <Image
          source={{ uri: item.coverImage }}
          style={styles.editorPickImage}
        />
        <Text style={styles.editorPickTitle} numberOfLines={2}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEditorPicksPage = ({ item }: { item: any[] }) => (
    <View style={styles.editorPicksPage}>
      <View style={styles.editorPicksRow}>
        {item.slice(0, 2).map((pick) => (
          <View key={pick.id} style={styles.editorPickContainer}>
            {renderEditorPick({ item: pick })}
          </View>
        ))}
      </View>
      <View style={styles.editorPicksRow}>
        {item.slice(2, 4).map((pick) => (
          <View key={pick.id} style={styles.editorPickContainer}>
            {renderEditorPick({ item: pick })}
          </View>
        ))}
      </View>
    </View>
  );

  const renderGenreHighlight = ({ item }: { item: any }) => {
    if (item.genre === "Rock") {
      const validItems = item.items.filter((album: any) => {
        const hasValidImage =
          album.coverImage && !album.coverImage.includes("spacer.gif");
        const [artist, title] = album.title.split(" - ", 2);
        return hasValidImage && artist && title;
      });
    }
    return (
      <View style={styles.genreSection}>
        <Text style={styles.genreTitle}>{item.genre}</Text>
        <FlatList
          data={item.items.filter(
            (album: any) =>
              album.coverImage && !album.coverImage.includes("spacer.gif")
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: album }) => {
            const [artist, title] = album.title.split(" - ", 2);
            return (
              <TouchableOpacity
                style={styles.genreAlbumCard}
                onPress={() => router.push(`/record/${album.id}` as any)}
              >
                <Image
                  source={{ uri: album.coverImage }}
                  style={styles.genreAlbumImage}
                />
                <Text style={styles.genreAlbumTitle} numberOfLines={1}>
                  {title || album.title}
                </Text>
                <Text style={styles.genreAlbumArtist} numberOfLines={1}>
                  {artist || "Unknown Artist"}
                </Text>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e54545" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#e54545", "#000000", "#000000", "#1a1a1a"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.3, 0.5, 1]}
        style={styles.container}
      >
        <CollapsibleHeader title="Explore" isVisible={isHeaderVisible} />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <Header
            title="Explore"
            profilePicture={profile?.profilePicture || ""}
            isVisible={!isHeaderVisible}
          />
          {featuredCollections.map((collection) => {
            console.log("Rendering collection:", {
              title: collection.title,
              items: collection.items,
              type: collection.type,
            });
            return (
              <View key={collection.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{collection.title}</Text>
                <FlatList
                  data={collection.items}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={renderFeaturedCollection}
                  keyExtractor={(item) => item.id}
                  onViewableItemsChanged={({ viewableItems }) => {
                    console.log("Viewable items:", viewableItems);
                  }}
                />
              </View>
            );
          })}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Editor's Picks</Text>
            <FlatList
              data={chunkArray(editorPicks, 4)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderEditorPicksPage}
              keyExtractor={(_, index) => `page-${index}`}
              contentContainerStyle={styles.editorPicksList}
            />
          </View>

          <FlatList
            data={genreHighlights}
            renderItem={renderGenreHighlight}
            keyExtractor={(item) => item.genre}
            scrollEnabled={false}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 20,
    marginBottom: 15,
  },
  albumCard: {
    width: CARD_WIDTH,
    marginLeft: 20,
  },
  albumImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 8,
  },
  albumTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  albumArtist: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },
  artistCard: {
    width: ARTIST_CARD_WIDTH,
    marginLeft: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  artistImage: {
    width: ARTIST_CARD_WIDTH,
    height: ARTIST_CARD_WIDTH,
    borderRadius: ARTIST_CARD_WIDTH / 2,
    borderWidth: 2,
    borderColor: "#e54545",
  },
  artistName: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  editorPickCard: {
    width: CARD_WIDTH,
  },
  editorPickImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 8,
  },
  editorPickTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  editorPicksList: {
    paddingRight: 20,
  },
  editorPicksPage: {
    marginLeft: 20,
  },
  editorPicksRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  editorPickContainer: {
    marginRight: 20,
  },
  genreSection: {
    marginBottom: 30,
  },
  genreTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 20,
    marginBottom: 15,
  },
  genreAlbumCard: {
    width: CARD_WIDTH,
    marginLeft: 20,
  },
  genreAlbumImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 8,
  },
  genreAlbumTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  genreAlbumArtist: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
});

const chunkArray = (arr: any[], size: number) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export default userExplore;
