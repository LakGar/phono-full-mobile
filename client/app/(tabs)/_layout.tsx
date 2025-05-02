import { Tabs } from "expo-router";
import React from "react";
import { BlurView } from "expo-blur";
import { View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DebugScreen from "../debug";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#e5411f",
        tabBarInactiveTintColor: "#9999",
        tabBarBackground: () => (
          <BlurView
            intensity={90}
            tint="dark"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 75,
              paddingBottom: 40,
            }}
          />
        ),
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopColor: "transparent",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 70,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="house" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="safari.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="barcode.viewfinder" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "Collection",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={24}
              name="square.stack.3d.up.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="magnifyingglass" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
