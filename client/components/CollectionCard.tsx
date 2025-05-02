import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Collection } from "../app/store/useCollectionStore";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.4;
const IMAGE_SIZE = (CARD_WIDTH - 20) / 2;

interface CollectionCardProps {
  collection: Collection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  const handlePress = () => {
    router.push(`/collection/${collection._id}`);
  };

  const renderImages = () => {
    if (collection.records.length === 0) {
      return (
        <View style={styles.imageContainer}>
          <View style={[styles.image, styles.placeholderImage]} />
        </View>
      );
    }

    if (collection.records.length < 4) {
      return (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: collection.records[0].image || "" }}
            style={[styles.image, { width: CARD_WIDTH, height: CARD_WIDTH }]}
          />
        </View>
      );
    }

    // If more than 4 records, show first record's image as collection cover
    return (
      <View style={styles.imageContainer}>
        {collection.records.slice(0, 4).map((record, index) => (
          <Image
            key={record._id}
            source={{ uri: record.image || "" }}
            style={[
              styles.image,
              {
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
                marginRight: index % 2 === 0 ? 10 : 0,
                marginBottom: index < 2 ? 10 : 0,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {renderImages()}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {collection.name}
        </Text>
        <View style={styles.genresContainer}>
          {collection.genre?.slice(0, 1).map((genre: string, index: number) => (
            <View key={index} style={styles.genreTag}>
              <Text style={styles.genreText}>{genre}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.recordCount}>
          {collection.records.length} records
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 8,
    gap: 0,
  },
  image: {
    borderRadius: 4,
  },
  placeholderImage: {
    backgroundColor: "#333",
    width: CARD_WIDTH,
    height: CARD_WIDTH,
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  genreTag: {
    backgroundColor: "rgba(229, 69, 69, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  genreText: {
    color: "#e54545",
    fontSize: 12,
    fontWeight: "500",
  },
  recordCount: {
    color: "#999",
    fontSize: 14,
  },
});
