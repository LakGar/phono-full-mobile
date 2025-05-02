import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "../store/useUserStore";
import { usePreferencesStore } from "../store/usePreferencesStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useCollectionStore } from "../store/useCollectionStore";
import { usePostStore } from "../store/usePostStore";
import { useRecordStore } from "../store/useRecordStore";

import CollapsibleHeader from "@/components/ui/CollapsibleHeader";
import Header from "@/components/ui/Header";
import ForYou from "@/components/ForYou";
import GenreSections from "@/components/GenreSections";

interface UserPreferences {
  theme: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    updates: boolean;
  };
  privacy: {
    profileVisibility: string;
    showEmail: boolean;
    showLikes: boolean;
    showCollections: boolean;
  };
  musicPreferences: {
    likedGenres: string[];
    dislikedGenres: string[];
    likedArtists: string[];
    dislikedArtists: string[];
    likedRecords: string[];
    dislikedRecords: string[];
  };
  display: {
    gridSize: string;
    sortBy: string;
    order: string;
    showDetails: boolean;
  };
}

export default function HomeScreen() {
  const {
    profile,
    isLoading: profileLoading,
    error,
    fetchProfile,
  } = useUserStore();
  const { fetchPreferences } = usePreferencesStore();
  const {
    collections,
    fetchCollections,
    isLoading: collectionsLoading,
  } = useCollectionStore();
  const { posts, fetchPosts } = usePostStore();
  const { records, fetchRecords } = useRecordStore();
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsHeaderVisible(offsetY > 30);
  };

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          router.replace("/(auth)/login");
          return;
        }

        // Fetch all data in parallel
        await Promise.all([
          fetchProfile(token),
          fetchPreferences(),
          fetchCollections(),
          fetchPosts(),
        ]);

        setIsDataLoaded(true);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    loadAllData();
  }, []);

  // Separate effect to handle navigation after data is loaded
  useEffect(() => {
    if (isDataLoaded && !collectionsLoading) {
      console.log("Data loaded, checking collections:", collections);
      if (!collections || collections.length === 0) {
        console.log("No collections found, redirecting to avatar setup");
        router.replace("/(onboarding)/avatar");
      }
    }
  }, [isDataLoaded, collections, collectionsLoading]);

  if (profileLoading || collectionsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#e54545" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={["#e54545", "#000000", "#000000", "#1a1a1a"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      locations={[0, 0.3, 0.5, 1]}
      style={styles.container}
    >
      <CollapsibleHeader title="Home" isVisible={isHeaderVisible} />
      <View style={styles.container}>
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <Header
            title="Home"
            profilePicture={
              profile?.profilePicture || "https://via.placeholder.com/150"
            }
            isVisible={!isHeaderVisible}
          />
          <View style={styles.content}>
            <View style={styles.greetingContainer}>
              <View>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.username}>{profile?.username}</Text>
              </View>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>
            <ForYou />
            <GenreSections />
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 80,
  },
  greetingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },

  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "capitalize",
  },
  dateContainer: {
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: 14,
    color: "#999",
  },
  errorText: {
    color: "#e54545",
    fontSize: 16,
    textAlign: "center",
  },
  debugSection: {
    margin: 20,
    padding: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 8,
  },
  debugTitle: {
    color: "#e54545",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  debugItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  debugLabel: {
    color: "#fff",
    fontSize: 14,
  },
  debugValue: {
    color: "#999",
    fontSize: 14,
  },
});
