import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useUserStore } from "../store/useUserStore";
import Toast from "react-native-toast-message";
import { usePreferencesStore } from "@/app/store/usePreferencesStore";
import CollectionsModal from "@/components/CollectionsModal";
import { useCollectionStore } from "@/app/store/useCollectionStore";

interface Album {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  year: number;
  genre: string;
  description?: string;
  tracklist?: string[];
  format?: string;
  country?: string;
  label?: string;
}

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = Platform.OS === "ios" ? 110 : 90;

export default function RecordScreen() {
  const { id } = useLocalSearchParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { profile, addToWishlist, removeFromWishlist } = useUserStore();
  const { toggleRecordLike, isRecordLiked } = usePreferencesStore();
  const { collections, fetchCollections, addRecordToCollection } =
    useCollectionStore();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(0);
  const [truncatedHeight, setTruncatedHeight] = useState(0);
  const [descriptionLines, setDescriptionLines] = useState(0);
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const coverScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.2, 1, 0.8],
    extrapolate: "clamp",
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.setValue(event.nativeEvent.contentOffset.y);
  };

  const handleDescriptionLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (showFullDescription) {
      setDescriptionHeight(height);
    } else {
      setTruncatedHeight(height);
    }
  };

  const [isCollectionsModalVisible, setIsCollectionsModalVisible] =
    useState(false);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  const handleCollectionPress = async () => {
    if (!album) return;
    try {
      setIsLoadingCollections(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Fetch collections and show modal
      await fetchCollections();
      setIsCollectionsModalVisible(true);
    } catch (error) {
      console.error("Error handling collection:", error);
      Toast.show({
        type: "error",
        text2:
          error instanceof Error
            ? error.message
            : "Failed to process collection request",
      });
    } finally {
      setIsLoadingCollections(false);
    }
  };

  const handleCollectionSelect = async (collectionId: string) => {
    try {
      if (!album) return;

      //check to see if the record already exists in the db
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/records`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discogsId: album.id,
          name: album.title,
          artist: album.artist,
          image: album.coverImage,
        }),
      });

      const data = await response.json();
      console.log("Record data:", data);

      if (!data.success || !data.record) {
        throw new Error(data.message || "Failed to create record");
      }

      // The store function already handles the JSON parsing
      const addResponse = await addRecordToCollection(
        collectionId,
        data.record._id
      );
      // Show appropriate toast based on the response
      if (addResponse.message === "Record already exists in collection") {
        Toast.show({
          type: "success",
          text1: "Already in Collection",
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Added to Collection",
        });
      }

      setIsCollectionsModalVisible(false);
    } catch (error) {
      console.error("Error adding to collection:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Add",
        text2:
          error instanceof Error
            ? error.message
            : "An error occurred while adding to collection",
      });
    }
  };

  const handleCreateNewCollection = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/collections`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "My Phono Collection",
        }),
      });

      if (response.ok) {
        await fetchCollections();
      } else {
        throw new Error("Failed to create collection");
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      Toast.show({
        type: "error",
        text2: "Failed to create collection",
      });
    }
  };

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          return;
        }

        const response = await fetch(`${API_URL}/discogs/albums/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response) {
          throw new Error("Failed to fetch album");
        }

        const data = await response.json();
        if (data.success) {
          setAlbum(data.album);
          const isInWishlist = Boolean(
            profile?.wishlist?.some(
              (wishlistItem) => wishlistItem === data.album.id
            )
          );
          setIsInWishlist(isInWishlist);
          setIsLiked(isRecordLiked(data.album.id));
        } else {
          setError(data.message || "Failed to load album");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbum();
  }, [id, profile?.wishlist, isRecordLiked]);

  const handleWishlistPress = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token || !album) return;

      if (isInWishlist) {
        await removeFromWishlist(album, token);
        Toast.show({
          type: "success",
          text1: "Removed from Wishlist",
        });
      } else {
        await addToWishlist(album, token);
        Toast.show({
          type: "success",
          text1: "Added to Wishlist",
        });
      }
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to Update",
      });
    }
  };

  const handleLikePress = async () => {
    try {
      if (!album) return;
      await toggleRecordLike(album.id);
      setIsLiked(!isLiked);
      Toast.show({
        type: "success",
        text1: isLiked ? "Removed from Likes" : "Added to Likes",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to Update",
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e54545" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#e54545" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!album) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="album" size={48} color="#e54545" />
        <Text style={styles.errorText}>Album not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={80} style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={["rgba(0,0,0,0.8)", "transparent"]}
            style={StyleSheet.absoluteFill}
          />
        </BlurView>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {album.title}
        </Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Animated.View
            style={[
              styles.coverContainer,
              { transform: [{ scale: coverScale }] },
            ]}
          >
            <Image
              source={{ uri: album.coverImage }}
              style={styles.albumCover}
              defaultSource={require("../../assets/images/defaults/default-album.png")}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.gradient}
            />
          </Animated.View>

          <View style={styles.albumInfo}>
            <Text style={styles.albumTitle}>{album?.title}</Text>
            <Text style={styles.albumArtist}>{album?.artist}</Text>
            <View style={styles.metaInfo}>
              {album?.year && (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar" size={16} color="#999" />
                  <Text style={styles.metaText}>{album.year}</Text>
                </View>
              )}
              {album?.genre && (
                <View style={styles.metaItem}>
                  <Ionicons name="musical-notes" size={16} color="#999" />
                  <Text style={styles.metaText}>{album.genre}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, isLiked && styles.activeButton]}
              onPress={handleLikePress}
            >
              <MaterialIcons
                name={isLiked ? "favorite" : "favorite-border"}
                size={24}
                color="#e54545"
              />
              <Text style={styles.actionButtonText}>
                {isLiked ? "Liked" : "Like"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, isInWishlist && styles.activeButton]}
              onPress={handleWishlistPress}
            >
              <MaterialIcons
                name={isInWishlist ? "bookmark" : "bookmark-border"}
                size={24}
                color="#e54545"
              />
              <Text style={styles.actionButtonText}>
                {isInWishlist ? "In Wishlist" : "Wishlist"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCollectionPress}
            >
              <MaterialIcons name="library-music" size={24} color="#e54545" />
              <Text style={styles.actionButtonText}>Collection</Text>
            </TouchableOpacity>
          </View>

          {album?.description && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <FontAwesome name="info-circle" size={20} color="#e54545" />
                  <Text style={styles.sectionTitle}>About</Text>
                </View>
                {album.description.length > 100 && (
                  <TouchableOpacity
                    style={styles.readMoreButton}
                    onPress={() => setShowFullDescription(!showFullDescription)}
                  >
                    <Text style={styles.readMoreText}>
                      {showFullDescription ? "Show Less" : "Read More"}
                    </Text>
                    <MaterialIcons
                      name={
                        showFullDescription
                          ? "keyboard-arrow-up"
                          : "keyboard-arrow-down"
                      }
                      size={20}
                      color="#e54545"
                    />
                  </TouchableOpacity>
                )}
              </View>
              <View>
                <Text
                  style={styles.description}
                  onLayout={handleDescriptionLayout}
                >
                  {showFullDescription
                    ? album.description
                    : album.description.length > 100
                    ? album.description.slice(0, 100) + "..."
                    : album.description}
                </Text>
              </View>
            </View>
          )}

          {album.tracklist && album.tracklist.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontAwesome name="list" size={20} color="#e54545" />
                <Text style={styles.sectionTitle}>Tracklist</Text>
              </View>
              {album.tracklist.map((track, index) => (
                <View key={index} style={styles.trackItem}>
                  <View style={styles.trackNumberContainer}>
                    <Text style={styles.trackNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.trackTitle}>{track}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="info" size={20} color="#e54545" />
              <Text style={styles.sectionTitle}>Details</Text>
            </View>
            <View style={styles.detailsGrid}>
              {album.format && (
                <View style={styles.detailItem}>
                  <Ionicons name="disc" size={20} color="#e54545" />
                  <Text style={styles.detailText}>{album.format}</Text>
                </View>
              )}
              {album.country && (
                <View style={styles.detailItem}>
                  <Ionicons name="globe" size={20} color="#e54545" />
                  <Text style={styles.detailText}>{album.country}</Text>
                </View>
              )}
              {album.label && (
                <View style={styles.detailItem}>
                  <Ionicons name="business" size={20} color="#e54545" />
                  <Text style={styles.detailText}>{album.label}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <CollectionsModal
        visible={isCollectionsModalVisible}
        onClose={() => setIsCollectionsModalVisible(false)}
        onSelect={handleCollectionSelect}
        onCreateNew={handleCreateNewCollection}
        collections={collections}
        isLoading={isLoadingCollections}
      />
    </View>
  );
}

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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  errorText: {
    color: "#e54545",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 100,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 20,
    flex: 1,
  },
  scrollView: {
    flex: 1,
    marginBottom: 60,
  },
  heroSection: {
    height: width * 1.2,
    position: "relative",
  },
  coverContainer: {
    width: width,
    height: width,
    position: "absolute",
    top: 0,
  },
  albumCover: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  albumInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  albumTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  albumArtist: {
    color: "#999",
    fontSize: 20,
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metaText: {
    color: "#fff",
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  description: {
    color: "#999",
    fontSize: 16,
    lineHeight: 24,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  trackNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(229, 69, 69, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  trackNumber: {
    color: "#e54545",
    fontSize: 14,
    fontWeight: "bold",
  },
  trackTitle: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1a1a1a",
    padding: 15,
    borderRadius: 12,
    flex: 1,
    minWidth: "45%",
  },
  detailText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(229, 69, 69, 0.1)",
    borderRadius: 12,
    width: "30%",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500",
  },
  activeButton: {
    backgroundColor: "rgba(229, 69, 69, 0.2)",
    borderWidth: 1,
    borderColor: "#e54545",
  },
  readMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readMoreText: {
    color: "#e54545",
    fontSize: 14,
    fontWeight: "500",
  },
});
