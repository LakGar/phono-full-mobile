import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useCollectionStore } from "@/app/store/useCollectionStore";
import { Collection } from "@/app/store/useCollectionStore";
import RecordActionMenu from "@/components/RecordActionMenu";
import { useUserStore } from "@/app/store/useUserStore";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;
const IMAGE_SIZE = (CARD_WIDTH - 20) / 2;
const HEADER_HEIGHT = 120;
const COLLAPSED_IMAGE_SIZE = 40;
const COLLAPSE_THRESHOLD = CARD_WIDTH; // Start showing header when image is scrolled out of view
const DESCRIPTION_LENGTH = 100;

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { collections, fetchCollections, deleteRecord } = useCollectionStore();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const loadCollection = async () => {
      try {
        if (collections.length === 0) {
          await fetchCollections(1, 10);
        }
        const foundCollection = collections.find(
          (c: Collection) => c._id === id
        );
        setCollection(foundCollection || null);
      } catch (error) {
        console.error("Error loading collection:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [id, collections, fetchCollections]);

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [COLLAPSE_THRESHOLD - 50, COLLAPSE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  const renderTags = (tags: string[], type: "genre" | "mood") => {
    if (!tags || tags.length === 0) return null;

    return (
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <View
            key={`${type}-${index}`}
            style={[
              styles.tag,
              {
                backgroundColor:
                  type === "genre"
                    ? "rgba(229, 69, 69, 0.2)"
                    : "rgba(102, 102, 102, 0.2)",
              },
            ]}
          >
            <Text
              style={[
                styles.tagText,
                {
                  color: type === "genre" ? "#e54545" : "#666",
                },
              ]}
            >
              {tag}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const renderDescription = () => {
    if (!collection?.description) return null;

    const shouldTruncate = collection.description.length > DESCRIPTION_LENGTH;
    const displayText = isDescriptionExpanded
      ? collection.description
      : collection.description.slice(0, DESCRIPTION_LENGTH) + "...";

    return (
      <View>
        <Text style={styles.description}>{displayText}</Text>
        {shouldTruncate && (
          <TouchableOpacity
            onPress={toggleDescription}
            style={styles.showMoreButton}
          >
            <Text style={styles.showMoreText}>
              {isDescriptionExpanded ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const handleMenuPress = (record: Record) => {
    setSelectedRecord(record);
    setMenuVisible(true);
  };

  const handleRemoveRecord = async () => {
    if (!selectedRecord || !collection) return;

    try {
      await deleteRecord(collection._id, selectedRecord._id);
      setCollection((prev) =>
        prev
          ? {
              ...prev,
              records: prev.records.filter((r) => r._id !== selectedRecord._id),
            }
          : null
      );
      Toast.show({
        type: "success",
        text1: "Record Removed",
        text2: `${selectedRecord.name} has been removed from the collection`,
      });
    } catch (error) {
      console.error("Error removing record:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to remove record from collection",
      });
    } finally {
      setMenuVisible(false);
    }
  };

  const handleLikeRecord = async () => {
    if (!selectedRecord) return;
    try {
      await likeRecord(selectedRecord._id);
      Toast.show({
        type: "success",
        text1: "Record Liked",
      });
    } catch (error) {
      console.error("Error liking record:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to like record",
      });
    }
  };

  const handleUnlikeRecord = async () => {
    if (!selectedRecord) return;
    try {
      await unlikeRecord(selectedRecord._id);
      Toast.show({
        type: "success",
        text1: "Record Unliked",
      });
    } catch (error) {
      console.error("Error unliking record:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to unlike record",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e5411f" />
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Collection not found</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          {collection.records.length > 0 && (
            <Image
              source={{ uri: collection.records[0].image || "" }}
              style={styles.headerImage}
            />
          )}
          <Text style={styles.headerTitle}>{collection.name}</Text>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={[styles.section, { paddingTop: 60 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          {collection.records.length > 0 && (
            <Image
              source={{ uri: collection.records[0].image || "" }}
              style={styles.mainImage}
            />
          )}
          <Text style={styles.mainTitle}>{collection.name}</Text>

          {renderDescription()}
          <View>
            <View style={styles.metadataSection}>
              <View style={[styles.tagsContainer]}>
                {collection.genre.map((genre, index) => (
                  <Text
                    key={`genre-${index}`}
                    style={[
                      styles.tagText,
                      {
                        color: "#e54545",
                        backgroundColor: "rgba(229, 69, 69, 0.2)",
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                      },
                    ]}
                  >
                    {genre || "No genre"}
                  </Text>
                ))}
              </View>
            </View>
            {/* <View style={styles.metadataSection}>
              <Text style={styles.metadataTitle}>Moods</Text>
              <View style={styles.tagsContainer}>
                {collection.mood.map((mood, index) => (
                  <Text
                    key={`mood-${index}`}
                    style={[
                      styles.tagText,
                      {
                        color: "#666",
                        backgroundColor: "rgba(102, 102, 102, 0.2)",
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                      },
                    ]}
                  >
                    {mood || "No mood"}
                  </Text>
                ))}
              </View>
            </View> */}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Records</Text>
          {collection.records?.length === 0 ? (
            <Text style={styles.emptyText}>No records in this collection</Text>
          ) : (
            collection.records?.map((record) => (
              <TouchableOpacity
                key={record._id}
                style={styles.recordItem}
                onPress={() => router.push(`/record/${record.discogsId}`)}
              >
                <Image
                  source={{
                    uri:
                      record?.image ||
                      "../../assets/images/defaults/default-album.png",
                  }}
                  style={styles.recordImage}
                />
                <View style={styles.recordInfo}>
                  <Text style={styles.recordTitle}>{record.name}</Text>
                  <Text style={styles.recordArtist}>{record.artist}</Text>
                </View>
                <TouchableOpacity onPress={() => handleMenuPress(record)}>
                  <MaterialIcons name="more-vert" size={24} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </Animated.ScrollView>

      <RecordActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onRemove={handleRemoveRecord}
        onLike={handleLikeRecord}
        onDislike={handleUnlikeRecord}
        isLiked={
          selectedRecord
            ? useUserStore
                .getState()
                .profile?.musicPreferences?.likedRecords?.includes(
                  selectedRecord.discogsId
                ) || false
            : false
        }
        recordId={selectedRecord?.discogsId || ""}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    backgroundColor: "rgba(0, 0, 0, 1)",
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    zIndex: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingBottom: 16,
  },
  headerImage: {
    width: COLLAPSED_IMAGE_SIZE,
    height: COLLAPSED_IMAGE_SIZE,
    borderRadius: 4,
    marginRight: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    marginRight: 16,
    marginBottom: 24,
  },
  content: {
    flex: 1,
    marginBottom: 64,
  },
  section: {
    padding: 16,
    paddingBottom: 0,
  },
  mainImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 8,
    marginBottom: 16,
    objectFit: "contain",
  },
  mainTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  description: {
    color: "#999",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  metadataSection: {
    marginBottom: 16,
  },
  metadataTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  recordImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 16,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  recordArtist: {
    color: "#999",
    fontSize: 14,
    marginTop: 4,
  },
  showMoreButton: {
    marginBottom: 24,
  },
  showMoreText: {
    color: "#e54545",
    fontSize: 16,
    fontWeight: "500",
  },
});
