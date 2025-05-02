import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { API_URL } from "../config/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Making request to:", `${API_URL}/users/login`);
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (data.success && data.data?.token) {
        console.log("Calling login with token");
        await login(data.data.token);
      } else if (
        data.message === "Please verify your email before logging in"
      ) {
        Alert.alert(
          "Email Not Verified",
          "Please verify your email to continue",
          [
            {
              text: "Verify Email",
              onPress: () => router.push(`/verifyEmail?email=${email}`),
            },
          ]
        );
      } else {
        Alert.alert("Error", data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Error",
        "Failed to connect to the server. Please check your internet connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={20} color="white" />
        </TouchableOpacity>
        <Image
          source={require("../../assets/images/phono-logo.png")}
          style={styles.logo}
        />
      </View>

      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Sign in to your account to continue</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="lightgray"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="lightgray"
          editable={!isLoading}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Signing In..." : "Sign In"}
        </Text>
      </TouchableOpacity>

      <View style={styles.links}>
        <Link href="../register" style={styles.link}>
          Create Account
        </Link>
        <Link href="../forgot-password" style={styles.link}>
          Forgot Password?
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0f0e",
    paddingVertical: 50,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    paddingLeft: 20,
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "left",
    color: "white",
    marginHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "left",
    color: "lightgray",
    marginHorizontal: 20,
  },
  form: {
    marginHorizontal: 20,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#666",
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    color: "white",
  },
  button: {
    backgroundColor: "#e54545",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 20,
  },
  buttonDisabled: {
    backgroundColor: "#8b2828",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  links: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
  },
  link: {
    color: "#e54545",
    fontSize: 16,
  },
});
