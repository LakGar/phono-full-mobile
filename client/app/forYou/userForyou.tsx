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
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUserStore } from "../store/useUserStore";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

const userForyou = () => {
  const { profile } = useUserStore();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  //   useEffect(() => {
  //     fetchRecommendations();
  //   }, []);

  //   const fetchRecommendations = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem("token");
  //       const response = await fetch(`${API_URL}/users/recommendations`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const data = await response.json();
  //       if (data.success) {
  //         setRecommendations(data.recommendations);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching recommendations:", error);
  //       Toast.show({
  //         type: "error",
  //         text1: "Error",
  //         text2: "Failed to load recommendations. Please try again.",
  //       });
  //     } finally {
  //       setIsLoading(false);
  //     }
//   };

  const handleAddToWishlist = async (recordId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recordId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        Toast.show({
          type: "success",
          text1: "Added to wishlist",
        });
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to add to wishlist. Please try again.",
      });
    }
  };

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
          <Text style={styles.title}>Made For You</Text>
        </Animated.View>

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
          ) : recommendations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="music.note" size={48} color="#666" />
              <Text style={styles.emptyText}>No recommendations yet</Text>
              <Text style={styles.emptySubtext}>
                We'll show you personalized recommendations based on your taste
              </Text>
            </View>
          ) : (
            <View style={styles.recommendationsContainer}>
              {recommendations.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recommendationItem}
                  onPress={() => router.push(`/record/${item.id}`)}
                >
                  <Image
                    source={{ uri: item.cover_image || item.thumb }}
                    style={styles.albumArt}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemArtist} numberOfLines={1}>
                      {item.artist}
                    </Text>
                    <Text style={styles.reason} numberOfLines={2}>
                      {item.reason}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.wishlistButton}
                    onPress={() => handleAddToWishlist(item.id)}
                  >
                    <IconSymbol name="heart" size={20} color="#e54545" />
                  </TouchableOpacity>
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
    paddingHorizontal: 20,
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
  recommendationsContainer: {
    padding: 20,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
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
  reason: {
    color: "#999",
    fontSize: 12,
    marginTop: 4,
  },
  wishlistButton: {
    padding: 8,
  },
});

export default userForyou;
