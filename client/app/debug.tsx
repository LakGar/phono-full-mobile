import React, { useEffect } from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config/api";

export default function DebugScreen() {
  useEffect(() => {
    const debug = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        console.log("Token:", token);

        if (token) {
          const response = await fetch(`${API_URL}/preferences`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          console.log("Preferences Response:", JSON.stringify(data, null, 2));
        }
      } catch (error) {
        console.error("Debug error:", error);
      }
    };

    debug();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Check console for debug output</Text>
    </View>
  );
}
