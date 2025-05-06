import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";

interface RecordActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onRemove: () => void;
  onLike: () => void;
  onDislike: () => void;
  isLiked: boolean;
  recordId: string;
}

const { width } = Dimensions.get("window");

export default function RecordActionMenu({
  visible,
  onClose,
  onRemove,
  recordId,
}: RecordActionMenuProps) {
  const handleViewRecord = () => {
    onClose();
    router.push(`/record/${recordId}`);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <BlurView intensity={40} style={styles.blurContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.menuContainer}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Record Options</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleViewRecord}
            >
              <MaterialIcons name="visibility" size={24} color="#fff" />
              <Text style={styles.menuText}>View Record</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.dangerItem]}
              onPress={onRemove}
            >
              <MaterialIcons name="delete-outline" size={24} color="#e54545" />
              <Text style={[styles.menuText, { color: "#e54545" }]}>
                Remove from Collection
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </BlurView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  blurContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    width: width * 0.8,
    maxWidth: 400,
    padding: 20,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  menuTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 15,
    fontWeight: "500",
  },
  dangerItem: {
    backgroundColor: "rgba(229, 69, 69, 0.1)",
  },
});
