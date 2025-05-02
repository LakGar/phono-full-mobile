import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Collection } from "../app/store/useCollectionStore";

interface CollectionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (collectionId: string) => void;
  onCreateNew: () => void;
  collections: Collection[] | undefined;
  isLoading: boolean;
}

const CollectionsModal = ({
  visible,
  onClose,
  onSelect,
  onCreateNew,
  collections = [],
  isLoading,
}: CollectionsModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add to Collection</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#e54545" />
            </View>
          ) : collections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No collections found</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={onCreateNew}
              >
                <Text style={styles.createButtonText}>Create Collection</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={collections}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.collectionItem}
                  onPress={() => onSelect(item._id)}
                >
                  <Text style={styles.collectionName}>{item.name}</Text>
                  <Text style={styles.recordCount}>
                    {item.records?.length || 0} records
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: "#e54545",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  collectionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  collectionName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  recordCount: {
    color: "#999",
    fontSize: 14,
    marginTop: 4,
  },
});

export default CollectionsModal;
