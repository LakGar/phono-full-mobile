import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { searchDiscogs } from "@/services/discogs";
import { useCollectionStore } from "../store";
import { useRecordStore } from "../store/useRecordStore";

const { width } = Dimensions.get("window");

interface Record {
  discogsId: string;
  name: string;
  artist: string;
  image: string;
  genre?: string;
  year?: number;
  style?: string[];
  format?: string[];
  country?: string;
  url?: string;
  community?: {
    have: number;
    want: number;
  };
}

export default function CollectionScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Record[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [collectionName, setCollectionName] = useState("My Phono Collection");
  const { createCollection, addRecordToCollection } = useCollectionStore();
  const { addRecord } = useRecordStore();
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const searchRecords = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/discogs/records/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.records);
      }
    } catch (error) {
      console.error("Error searching records:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setIsLoading(true);
    try {
      const results = await searchDiscogs(data);
      if (results.length > 0) {
        const record = results[0];
        setSelectedRecords((prev) => {
          if (prev.find((r) => r.discogsId === record.id)) {
            return prev;
          }
          return [
            ...prev,
            {
              discogsId: record.id,
              name: record.title,
              artist: record.artist,
              image: record.cover_image,
              year: record.year,
              genre: record.genre?.[0],
            },
          ];
        });
        Alert.alert("Success", "Record added to collection");
      } else {
        Alert.alert("Not Found", "No record found with this barcode");
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);
      Alert.alert("Error", "Failed to search for record");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEntry = async () => {
    if (!barcode) {
      Alert.alert("Error", "Please enter a valid barcode");
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchDiscogs(barcode);
      if (results.length > 0) {
        const record = results[0];
        setSelectedRecords((prev) => {
          if (prev.find((r) => r.discogsId === record.id)) {
            return prev;
          }
          return [
            ...prev,
            {
              discogsId: record.id,
              name: record.title,
              artist: record.artist,
              image: record.cover_image,
              year: record.year,
              genre: record.genre?.[0],
            },
          ];
        });
        setShowManualEntry(false);
        Alert.alert("Success", "Record added to collection");
      } else {
        Alert.alert("Not Found", "No record found with this barcode");
      }
    } catch (error) {
      console.error("Error with manual entry:", error);
      Alert.alert("Error", "Failed to search for record");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecord = (record: Record) => {
    setSelectedRecords((prev) => {
      if (prev.find((r) => r.discogsId === record.discogsId)) {
        return prev.filter((r) => r.discogsId !== record.discogsId);
      }
      return [...prev, record];
    });
  };

  const handleCreateCollection = async () => {
    if (selectedRecords.length === 0) {
      Alert.alert("Required", "Please select at least one record");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Starting collection creation process...");
      const token = await AsyncStorage.getItem("token");
      console.log("Token retrieved:", token ? "exists" : "missing");

      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Creating collection with title:", collectionName);
      const newCollection = await createCollection({ name: collectionName });
      console.log("Collection creation response:", newCollection);

      if (!newCollection || !newCollection._id) {
        console.error("Invalid collection response:", newCollection);
        throw new Error("Failed to create collection");
      }

      console.log("Collection created successfully, ID:", newCollection._id);
      console.log("Starting to add records to collection...");

      // Add each record to the collection
      for (const record of selectedRecords) {
        try {
          console.log("Processing record:", record.name);
          // Create or get the record
          const recordResponse = await fetch(`${API_URL}/records`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: record.name,
              artist: record.artist,
              discogsId: record.discogsId,
              image: record.image,
              genre: record.genre,
              year: record.year,
              description: "",
              mood: "neutral",
            }),
          });

          const recordData = await recordResponse.json();
          console.log("Record creation response:", recordData);

          if (!recordData.success || !recordData.record) {
            throw new Error("Failed to create record");
          }

          const recordId = recordData.record._id;
          console.log("Adding record to collection with ID:", recordId);

          // Add the record to the collection
          await addRecordToCollection(newCollection._id, recordId);
          console.log("Record added to collection successfully");
        } catch (error) {
          console.error("Error processing record:", record.name, error);
          Alert.alert(
            "Error Adding Record",
            `Failed to add record: ${record.name}. You can try adding it later.`
          );
        }
      }

      // Show success message and navigate back
      Alert.alert("Success", "Collection created successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/(tabs)"),
        },
      ]);
    } catch (error) {
      console.error("Error creating collection:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create collection",
        [
          {
            text: "Try Again",
            style: "default",
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => router.back(),
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isScannerVisible) {
    if (!permission) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Requesting camera permission...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>No access to camera</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowManualEntry(true)}
          >
            <Text style={styles.buttonText}>Enter Barcode Manually</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsScannerVisible(false)}>
            <IconSymbol name="arrow.left" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
          }}
          style={styles.camera}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
            <Text style={styles.overlayText}>Scan a record barcode</Text>
          </View>
        </CameraView>

        <View style={styles.controls}>
          {scanned && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setScanned(false)}
            >
              <IconSymbol name="arrow.clockwise" size={24} color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>

        <Modal
          visible={showManualEntry}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowManualEntry(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowManualEntry(false)}
                  style={styles.closeButton}
                >
                  <IconSymbol name="xmark" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Enter Barcode</Text>
                <View style={styles.closeButton} />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Record Barcode</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter barcode number"
                  placeholderTextColor="#666666"
                  value={barcode}
                  onChangeText={setBarcode}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleManualEntry}
              >
                <Text style={styles.submitButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Collection</Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setIsScannerVisible(true)}
        >
          <IconSymbol name="qrcode.viewfinder" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search records..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchRecords(text);
          }}
        />
        {isSearching && (
          <ActivityIndicator style={styles.searchSpinner} color="#e54545" />
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.grid}>
          {searchResults.map((record) => (
            <TouchableOpacity
              key={record.discogsId}
              style={[
                styles.recordItem,
                {
                  borderColor: selectedRecords.find(
                    (r) => r.discogsId === record.discogsId
                  )
                    ? "#e54545"
                    : "#333",
                },
              ]}
              onPress={() => toggleRecord(record)}
            >
              <Image
                source={{ uri: record.image }}
                style={styles.recordImage}
                defaultSource={require("../../assets/images/defaults/default-album.svg")}
              />
              <View style={styles.recordInfo}>
                <Text style={styles.recordName} numberOfLines={1}>
                  {record.name}
                </Text>
                <Text style={styles.recordArtist} numberOfLines={1}>
                  {record.artist}
                </Text>
                {record.year && (
                  <Text style={styles.recordYear}>{record.year}</Text>
                )}
                {record.genre && (
                  <Text style={styles.recordGenre}>{record.genre}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.selectionCount}>
          {selectedRecords.length} records selected
        </Text>
        <TouchableOpacity
          style={[
            styles.createButton,
            {
              opacity:
                isLoading ||
                selectedRecords.length === 0 ||
                !collectionName.trim()
                  ? 0.5
                  : 1,
            },
          ]}
          onPress={handleCreateCollection}
          disabled={
            isLoading || selectedRecords.length === 0 || !collectionName.trim()
          }
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Collection</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 15,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  scanButton: {
    padding: 10,
  },
  nameContainer: {
    margin: 20,
    marginBottom: 0,
  },
  nameInput: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
  },
  searchContainer: {
    margin: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
  },
  searchSpinner: {
    position: "absolute",
    right: 15,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    gap: 10,
  },
  recordItem: {
    width: "43%",
    borderRadius: 12,
    borderWidth: 2,
    overflow: "hidden",
    margin: "2.5%",
    backgroundColor: "#1a1a1a",
  },
  recordImage: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
  },
  recordInfo: {
    padding: 10,
  },
  recordName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  recordArtist: {
    color: "#999",
    fontSize: 12,
    marginTop: 2,
  },
  recordYear: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
  recordGenre: {
    color: "#999",
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  selectionCount: {
    color: "#999",
    textAlign: "center",
    marginBottom: 10,
  },
  createButton: {
    backgroundColor: "#e54545",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cameraContainer: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 2,
    borderColor: "#1DB954",
    borderRadius: 20,
  },
  overlayText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
  controls: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  controlButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 120,
  },
  controlButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 60 : 20,
    marginBottom: 40,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    marginBottom: 40,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 15,
    color: "#FFFFFF",
    fontSize: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  submitButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1DB954",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
