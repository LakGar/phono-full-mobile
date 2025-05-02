import React from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import { toastConfig } from "../config/toast";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();

  console.log("RootLayoutNav - Auth State:", { isAuthenticated, isLoading });

  if (isLoading) {
    console.log("RootLayoutNav - Showing loading state");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  console.log(
    "RootLayoutNav - Rendering navigation, isAuthenticated:",
    isAuthenticated
  );

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(protected)" />
          <Stack.Screen name="(onboarding)" />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    console.log("RootLayout - Fonts not loaded yet");
    return null;
  }

  console.log("RootLayout - Rendering root layout");

  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <RootLayoutNav />
        <Toast config={toastConfig} />
      </AuthProvider>
    </ThemeProvider>
  );
}
