import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import React from "react";
import { router } from "expo-router";

const Header = ({
  title,
  profilePicture,
  isVisible,
}: {
  title: string;
  profilePicture: string;
  isVisible: boolean;
}) => {
  return (
    <Animated.View style={[styles.container, { opacity: isVisible ? 1 : 0 }]}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={() => router.push("/profile/profile")}>
        <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 75,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "white",
  },
});
