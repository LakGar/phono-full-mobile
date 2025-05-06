import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useUserStore } from "../store/useUserStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { IconSymbol } from "@/components/ui/IconSymbol";

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

const EditProfile = () => {
  const { profile, updateProfile, isLoading, error } = useUserStore();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    profilePicture: "",
  });
  const [token, setToken] = useState<string | null>(null);
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      setToken(storedToken);
    };
    getToken();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        username: profile.username || "",
        email: profile.email || "",
        bio: profile.bio || "",
        profilePicture: profile.profilePicture || "",
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    handleChange("profilePicture", avatarUrl);
    setShowAvatarGrid(false);
  };

  const handleSubmit = async () => {
    if (!token) return;

    try {
      await updateProfile(formData, token);
      router.back();
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={["#e54545", "#000000", "#000000", "#1a1a1a"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.3, 0.5, 1]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#e54545", "#000000", "#000000", "#1a1a1a"]}
      start={{ x: 1, y: 0 }}
      end={{ x: 1, y: 1 }}
      locations={[0, 0.3, 0.5, 1]}
      style={styles.container}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol name="chevron.left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profilePictureContainer}>
          <TouchableOpacity onPress={() => setShowAvatarGrid(true)}>
            {formData.profilePicture ? (
              <Image
                source={{ uri: formData.profilePicture }}
                style={styles.profilePicture}
              />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <IconSymbol name="person.crop.circle" size={40} color="#666" />
                <Text style={styles.profilePicturePlaceholderText}>
                  Select Avatar
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Modal
          visible={showAvatarGrid}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAvatarGrid(false)}
        >
          <View style={styles.modalOverlay}>
            <LinearGradient
              colors={["#000000", "#000000", "#000000", "#000000"]}
              start={{ x: 1, y: 0 }}
              end={{ x: 1, y: 1 }}
              locations={[0, 0.3, 0.5, 1]}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Avatar</Text>
                <TouchableOpacity
                  onPress={() => setShowAvatarGrid(false)}
                  style={styles.closeButton}
                >
                  <IconSymbol name="xmark" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={AVATARS}
                numColumns={3}
                contentContainerStyle={styles.avatarGrid}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.avatarItem}
                    onPress={() => handleAvatarSelect(item.image)}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.avatarOption}
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
              />
            </LinearGradient>
          </View>
        </Modal>

        <View style={styles.form}>
          <View style={styles.menuItem}>
            <IconSymbol name="person" size={24} color="#e5411f" />
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleChange("name", value)}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>

          <View style={styles.menuItem}>
            <IconSymbol name="at" size={24} color="#e5411f" />
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(value) => handleChange("username", value)}
              placeholder="Enter your username"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>

          <View style={styles.menuItem}>
            <IconSymbol name="envelope" size={24} color="#e5411f" />
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleChange("email", value)}
              placeholder="Enter your email"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.menuItem}>
            <IconSymbol name="text.quote" size={24} color="#e5411f" />
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={formData.bio}
              onChangeText={(value) => handleChange("bio", value)}
              placeholder="Tell us about yourself"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
              numberOfLines={4}
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 50,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  saveButton: {
    padding: 5,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  profilePictureContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#e5411f",
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5411f",
  },
  profilePicturePlaceholderText: {
    color: "#fff",
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    flex: 1,
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    padding: 5,
  },
  avatarGrid: {
    padding: 10,
  },
  avatarItem: {
    flex: 1,
    padding: 5,
  },
  avatarOption: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e5411f",
  },
  form: {
    paddingHorizontal: 20,
    gap: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginLeft: 16,
    padding: 0,
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#e5411f",
    marginTop: 10,
    textAlign: "center",
  },
});
