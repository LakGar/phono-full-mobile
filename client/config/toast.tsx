import React from "react";
import { View, Text } from "react-native";
import Toast from "react-native-toast-message";
import { IconSymbol } from "../components/ui/IconSymbol";

export const showToast = (
  type: "success" | "error" | "info",
  title: string,
  message: string
) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: "top",
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 50,
    bottomOffset: 40,
  });
};

export const toastConfig = {
  success: ({ text1, text2 }: { text1: string; text2: string }) => (
    <View
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: 16,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <IconSymbol name="checkmark.circle" size={20} color="#4CAF50" />
      <View style={{ marginLeft: 12 }}>
        <Text
          style={{
            color: "white",
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {text1}
        </Text>
        {text2 && (
          <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
  error: ({ text1, text2 }: { text1: string; text2: string }) => (
    <View
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: 16,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <IconSymbol name="xmark.circle" size={20} color="#F44336" />
      <View style={{ marginLeft: 12 }}>
        <Text
          style={{
            color: "white",
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {text1}
        </Text>
        {text2 && (
          <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
  info: ({ text1, text2 }: { text1: string; text2: string }) => (
    <View
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: 16,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <IconSymbol name="info.circle" size={20} color="#2196F3" />
      <View style={{ marginLeft: 12 }}>
        <Text
          style={{
            color: "white",
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {text1}
        </Text>
        {text2 && (
          <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
};
