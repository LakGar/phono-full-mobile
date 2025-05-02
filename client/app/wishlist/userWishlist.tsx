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
  Alert,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUserStore } from "../store/useUserStore";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { Record } from "../store/useRecordStore";

const { width } = Dimensions.get("window");

const userWishlist = () => {
  const { profile, fetchProfile } = useUserStore();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [wishListData, setWishListData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchWishlist();
  }, []);

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

      setWishListData(newWishListData);
      console.log("Updated wishlist data:", newWishListData);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load wishlist. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (recordId: string) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/wishlist/${recordId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setWishlist(wishlist.filter((item) => item.id !== recordId));
        Toast.show({
          type: "success",
          text1: "Removed from wishlist",
        });
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to remove from wishlist. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <Text style={styles.title}>Your Wishlist</Text>
        </Animated.View>

        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your wishlist..."
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
          ) : wishListData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="heart.slash" size={48} color="#666" />
              <Text style={styles.emptyText}>Your wishlist is empty</Text>
              <Text style={styles.emptySubtext}>
                Add records to your wishlist to see them here
              </Text>
            </View>
          ) : (
            <View style={styles.wishlistContainer}>
              {wishListData.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.wishlistItem}
                  onPress={() => router.push(`/record/${item.id}`)}
                >
                  <Image
                    source={{
                      uri:
                        item.coverImage ||
                        "../../assets/images/defaults/default-album.png",
                    }}
                    style={styles.albumArt}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemArtist} numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </View>
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
  wishlistContainer: {
    padding: 20,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  wishlistItem: {
    flexDirection: "column",
    marginBottom: 10,
    padding: 10,
    width: "44%",
  },
  albumArt: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  itemArtist: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
});

export default userWishlist;
