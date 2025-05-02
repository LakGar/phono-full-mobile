import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { API_URL } from "../config/api";
export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    try {
      console.log("Making request to:", `${API_URL}/users/register`);
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, username, email, password }),
      });
      const data = await response.json();
      if (data.success) {
        router.push(`/verifyEmail?email=${email}`);
      } else {
        Alert.alert("Error", data.message || "Registration failed");
      }
      console.log("Response:", data);
    } catch (error) {
      Alert.alert("Error", "Failed to login");
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
      <Text style={styles.title}>Create an Account</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="lightgray"
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="lightgray"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="lightgray"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="lightgray"
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="lightgray"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <View style={styles.links}>
        <Link href="../login" style={styles.link}>
          Already have an account?
        </Link>
        <Link href="../forgot-password" style={styles.link}></Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 50,

    backgroundColor: "#0e0f0e",
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
