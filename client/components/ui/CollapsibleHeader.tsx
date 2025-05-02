import { StyleSheet, Text, View, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CollapsibleHeaderProps {
  title: string;
  isVisible: boolean;
}

const CollapsibleHeader = ({ title, isVisible }: CollapsibleHeaderProps) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
        <Text style={styles.title}>{title}</Text>
      </BlurView>
    </Animated.View>
  );
};

export default CollapsibleHeader;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: -72,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  blurContainer: {
    padding: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    paddingTop: 60,
  },
});
