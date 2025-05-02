import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useUserStore } from "@/app/store/useUserStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Preset avatars with different styles
const AVATARS = [
  {
    id: 1,
    image:
      "https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg?semt=ais_hybrid&w=740",
  },
  {
    id: 2,
    image:
      "https://img.freepik.com/free-psd/3d-illustration-with-online-avatar_23-2151303097.jpg?semt=ais_hybrid&w=740",
  },
  {
    id: 3,
    image:
      "https://img.freepik.com/free-psd/3d-rendering-hair-style-avatar-design_23-2151869149.jpg?semt=ais_hybrid&w=740",
  },
  {
    id: 4,
    image:
      "https://img.freepik.com/free-psd/3d-rendering-hair-style-avatar-design_23-2151869153.jpg?semt=ais_hybrid&w=740",
  },
  {
    id: 5,
    image:
      "https://img.freepik.com/free-psd/3d-rendering-hair-style-avatar-design_23-2151869159.jpg?semt=ais_hybrid&w=740",
  },
  {
    id: 6,
    image:
      "https://img.freepik.com/free-psd/3d-illustration-with-online-avatar_23-2151303045.jpg?ga=GA1.1.363976053.1745719748&semt=ais_hybrid&w=740",
  },
  {
    id: 7,
    image:
      "https://img.freepik.com/free-psd/3d-rendering-hair-style-avatar-design_23-2151869121.jpg?ga=GA1.1.363976053.1745719748&semt=ais_hybrid&w=740",
  },
  {
    id: 8,
    image:
      "https://img.freepik.com/free-psd/3d-illustration-with-online-avatar_23-2151303087.jpg?ga=GA1.1.363976053.1745719748&semt=ais_hybrid&w=740",
  },
  {
    id: 9,
    image:
      "https://img.freepik.com/free-psd/3d-illustration-with-online-avatar_23-2151303048.jpg?ga=GA1.1.363976053.1745719748&semt=ais_hybrid&w=740",
  },
  {
    id: 10,
    image:
      "https://img.freepik.com/premium-psd/3d-rendering-hair-style-avatar-design_23-2151869171.jpg?ga=GA1.1.363976053.1745719748&w=740",
  },
  {
    id: 11,
    image:
      "https://img.freepik.com/free-psd/3d-rendering-hair-style-avatar-design_23-2151869145.jpg?ga=GA1.1.363976053.1745719748&w=740",
  },
  {
    id: 12,
    image:
      "https://img.freepik.com/free-psd/3d-rendering-hair-style-avatar-design_23-2151869141.jpg?ga=GA1.1.363976053.1745719748&w=740",
  },
];

export default function AvatarSelectionScreen() {
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [loadingImages, setLoadingImages] = useState(true);
  const [loadedImages, setLoadedImages] = useState<number[]>([]);
  const pulseAnim = new Animated.Value(1);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const profile = useUserStore((state) => state.profile);
  const fetchProfile = useUserStore((state) => state.fetchProfile);

  useEffect(() => {
    // Start pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleImageLoad = (id: number) => {
    setLoadedImages((prev) => [...prev, id]);
    if (loadedImages.length + 1 === AVATARS.length) {
      setLoadingImages(false);
    }
  };

  const handleNext = async () => {
    if (selectedAvatar === null) {
      Alert.alert("Selection Required", "Please select an avatar");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }

      // Ensure we have the current profile
      if (!profile) {
        await fetchProfile(token);
      }

      const selectedAvatarUrl = AVATARS.find(
        (avatar) => avatar.id === selectedAvatar
      )?.image;
      if (!selectedAvatarUrl) {
        Alert.alert("Error", "Selected avatar not found");
        return;
      }

      // Update profile with the new picture while preserving required fields
      await updateProfile(
        {
          ...profile,
          profilePicture: selectedAvatarUrl,
        },
        token
      );

      router.push("/(onboarding)/genres" as const);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      Alert.alert("Error", "Failed to update profile picture");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Avatar</Text>
      </View>

      <Text style={styles.subtitle}>Select an avatar that represents you</Text>

      <ScrollView style={styles.scrollView}>
        <View style={styles.grid}>
          {AVATARS.filter((avatar) => avatar.id && avatar.image).map(
            (avatar) => (
              <View key={avatar.id} style={styles.avatarContainer}>
                {loadingImages && !loadedImages.includes(avatar.id) && (
                  <Animated.View
                    style={[
                      styles.loadingBlock,
                      {
                        transform: [{ scale: pulseAnim }],
                        opacity: pulseAnim,
                      },
                    ]}
                  >
                    <ActivityIndicator size="small" color="#e54545" />
                  </Animated.View>
                )}
                <TouchableOpacity
                  style={[
                    styles.avatarItem,
                    {
                      borderColor:
                        selectedAvatar === avatar.id ? "#e54545" : "#333",
                      borderWidth: selectedAvatar === avatar.id ? 3 : 2,
                    },
                  ]}
                  onPress={() => setSelectedAvatar(avatar.id ?? null)}
                >
                  <Image
                    source={{ uri: avatar.image }}
                    style={styles.avatarImage}
                    onLoad={() => handleImageLoad(avatar.id)}
                  />
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              opacity: selectedAvatar !== null ? 1 : 0.5,
            },
          ]}
          onPress={handleNext}
          disabled={selectedAvatar === null}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "left",
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    marginHorizontal: 20,
    marginBottom: 20,
    textAlign: "left",
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    gap: 10,
    justifyContent: "center",
  },
  avatarContainer: {
    width: "28%",
    aspectRatio: 1,
    margin: "1.5%",
  },
  avatarItem: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  nextButton: {
    backgroundColor: "#e54545",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingBlock: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
