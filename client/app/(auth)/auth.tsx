import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import { router } from "expo-router";
const auth = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/phono-logo-full.png")}
          style={styles.logo}
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => router.push("/register")}
      >
        <Text style={styles.buttonSecondaryText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default auth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#0e0f0e",
    padding: 20,
    paddingVertical: 60,
  },
  logoContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 400,
    objectFit: "contain",
  },
  button: {
    backgroundColor: "#e5411f",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: "#666",
    padding: 15,
    borderRadius: 5,
    width: "100%",
  },
  buttonSecondaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
