import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  RefreshControl,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useUserStore } from "@/app/store/useUserStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showToast } from "@/config/toast";
import { useCollectionStore } from "../store/useCollectionStore";
import { API_URL } from "../config/api";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 50) / 2; // 2 columns with 20px padding
const HEADER_HEIGHT = 100;
const PROFILE_IMAGE_SIZE = 80;
const { logout } = useAuth();

interface Collection {
  _id: string;
  name: string;
  coverImage?: string;
  records?: any[];
}

interface WishlistItem {
  id: string;
  title: string;
  artist: string;
  coverImage?: string;
}

interface UserProfile {
  _id: string;
  name: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  followers: string[];
  following: string[];
  collections: Collection[];
  wishlist: WishlistItem[];
}

export default function Profile() {
  const { profile, fetchProfile, isLoading } = useUserStore();
  const {
    collections,
    fetchCollections,
    isLoading: isLoadingCollections,
  } = useCollectionStore();
  const [activeTab, setActiveTab] = useState("collections");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [wishlistData, setWishlistData] = useState<WishlistItem[]>([]);

  useEffect(() => {
    loadProfile();
    fetchCollections();
    fetchWishlist();
  }, []);
  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        await fetchProfile(token);
      }
    } catch (error) {
      showToast("error", "Error", "Failed to load profile");
    }
  };

  const fetchWishlist = async () => {
    try {
      console.log("Profile wishlist:", profile?.wishlist);
      if (!profile?.wishlist) return;
      const token = await AsyncStorage.getItem("token");
      const newWishListData = [];

      for (const record of profile?.wishlist) {
        const response = await fetch(`${API_URL}/discogs/albums/${record}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch album");
        }
        const data = await response.json();
        if (data.success) {
          newWishListData.push(data.album);
        }
      }

      setWishlistData(newWishListData);
      console.log("Updated wishlist data:", newWishListData);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load wishlist. Please try again.",
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProfile();
    setIsRefreshing(false);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsHeaderVisible(offsetY > 200);
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <TouchableOpacity
        style={styles.statItem}
        // onPress={() => router.push("/(tabs)/followers")}
      >
        <Text style={styles.statNumber}>{profile?.followers?.length || 0}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.statItem}
        // onPress={() => router.push("/(tabs)/following")}
      >
        <Text style={styles.statNumber}>{profile?.following?.length || 0}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </TouchableOpacity>
      {/* <View style={styles.statItem}>
        <Text style={styles.statNumber}>{collections.length || 0}</Text>
        <Text style={styles.statLabel}>Collections</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{profile?.wishlist?.length || 0}</Text>
        <Text style={styles.statLabel}>Wishlist</Text>
      </View> */}
    </View>
  );

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: scrollY.interpolate({
            inputRange: [0, 100, 120],
            outputRange: [0, 0, 1],
            extrapolate: "clamp",
          }),
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [0, 100, 120],
                outputRange: [-100, -50, 0],
                extrapolate: "clamp",
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <IconSymbol name="chevron.left" size={16} color="#fff" />
      </TouchableOpacity>
      <View style={styles.headerProfile}>
        <Image
          source={{
            uri: profile?.profilePicture || "https://via.placeholder.com/150",
          }}
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
        />
        <View style={styles.headerProfileInfo}>
          <Text style={styles.headerName}>{profile?.name}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.settingsButton}
        // onPress={() => router.push("/(tabs)/settings")}
      >
        <IconSymbol name="gear" size={24} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );

  if (isLoading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e54545" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#e54545", "#000000", "#1a1a1a"]}
        style={styles.gradient}
      >
        {renderHeader()}
        <Animated.ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false, listener: handleScroll }
          )}
          scrollEventThrottle={16}
        >
          <View
            style={[styles.profileInfo, { opacity: isHeaderVisible ? 0 : 1 }]}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                position: "absolute",
                top: 60,
                left: 16,
                zIndex: 1000,
              }}
            >
              <IconSymbol name="chevron.left" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              //   onPress={() => router.push("/(tabs)/settings")}
              style={[
                {
                  position: "absolute",
                  top: 60,
                  right: 16,
                  zIndex: 1000,
                },
                styles.settingsButton,
              ]}
            >
              <IconSymbol name="gear" size={24} color="#fff" />
            </TouchableOpacity>

            <Image
              source={{
                uri:
                  profile?.profilePicture || "https://via.placeholder.com/150",
              }}
              style={styles.profileImage}
            />
            <Text style={styles.name}>{profile?.name}</Text>
            <Text style={styles.username}>@{profile?.username}</Text>
            {profile?.bio && (
              <Text style={styles.bio} numberOfLines={3}>
                {profile.bio}
              </Text>
            )}
          </View>

          {/* {renderStats()} */}
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.buttonPrimary}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSecondary} onPress={logout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "collections" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("collections")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "collections" && styles.activeTabText,
                ]}
              >
                Collections
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "wishlist" && styles.activeTab]}
              onPress={() => setActiveTab("wishlist")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "wishlist" && styles.activeTabText,
                ]}
              >
                Wishlist
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "collections" ? (
            <View style={styles.listContainer}>
              {collections.map((item, index) => (
                <TouchableOpacity
                  key={`collection-${item._id}-${index}`}
                  style={styles.collectionCard}
                  onPress={() => router.push(`/collection/${item._id}`)}
                >
                  {item.records && item.records.length > 4 ? (
                    <View style={styles.collectionImage}>
                      {item.records.slice(0, 4).map((record, recordIndex) => (
                        <Image
                          key={`${item._id}-${recordIndex}`}
                          source={{
                            uri:
                              record.image || "https://via.placeholder.com/300",
                          }}
                          style={{ width: "48%", height: 100 }}
                        />
                      ))}
                    </View>
                  ) : item.records && item.records.length > 0 ? (
                    <Image
                      source={{
                        uri:
                          item.records[0]?.image ||
                          "https://via.placeholder.com/300",
                      }}
                      style={styles.collectionImage}
                    />
                  ) : (
                    <View style={styles.collectionImage}>
                      <Image
                        source={require("../../assets/images/defaults/default-album.png")}
                        style={styles.collectionImage}
                      />
                    </View>
                  )}
                  <View style={styles.collectionInfo}>
                    <Text style={styles.collectionTitle} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.collectionCount}>
                      {item.records?.length || 0} records
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              {collections.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No collections yet</Text>
                  <TouchableOpacity
                    style={styles.createButton}
                    // onPress={() => router.push("/(tabs)/create-collection")}
                  >
                    <Text style={styles.createButtonText}>
                      Create Collection
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.listContainer}>
              {wishlistData.map((item, index) => (
                <TouchableOpacity
                  key={`wishlist-${item.id}-${index}`}
                  style={styles.wishlistCard}
                  onPress={() => router.push(`/record/${item.id}`)}
                >
                  <Image
                    source={{
                      uri: item.coverImage || "https://via.placeholder.com/300",
                    }}
                    style={styles.wishlistImage}
                  />
                  <View style={styles.wishlistInfo}>
                    <Text style={styles.wishlistTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.wishlistArtist} numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              {wishlistData.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No items in wishlist</Text>
                  <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={() => router.push("/(tabs)/explore")}
                  >
                    <Text style={styles.exploreButtonText}>
                      Explore Records
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </Animated.ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 40,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },
  headerProfile: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 16,
  },
  headerProfileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    marginRight: 12,
  },
  headerProfileInfo: {
    flex: 1,
  },
  headerName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  headerUsername: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
  settingsButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    backdropFilter: "blur(10px)",
  },
  profileInfo: {
    alignItems: "center",
    paddingTop: 60,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
  },
  username: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16,
    marginBottom: 12,
  },
  bio: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    backdropFilter: "blur(10px)",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    backdropFilter: "blur(10px)",
    gap: 10,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: "#e54545",
    padding: 16,
    borderRadius: 6,
    backdropFilter: "blur(10px)",
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 6,
    backdropFilter: "blur(10px)",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },

  statItem: {
    alignItems: "center",
    padding: 8,
  },
  statNumber: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: "row",
    padding: 20,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    backdropFilter: "blur(10px)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#e54545",
  },
  tabText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    justifyContent: "space-between",
  },
  collectionCard: {
    width: CARD_WIDTH,
    marginRight: 10,
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    overflow: "hidden",
    backdropFilter: "blur(10px)",
  },
  collectionImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 0,
  },
  collectionInfo: {
    padding: 12,
  },
  collectionTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  collectionCount: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
  },
  wishlistCard: {
    width: CARD_WIDTH - 5,
    marginRight: 10,
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    overflow: "hidden",
    backdropFilter: "blur(10px)",
  },
  wishlistImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  wishlistInfo: {
    padding: 12,
  },
  wishlistTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  wishlistArtist: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    margin: 20,
    borderRadius: 16,
    backdropFilter: "blur(10px)",
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  exploreButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backdropFilter: "blur(10px)",
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
