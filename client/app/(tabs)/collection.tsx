import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useUserStore } from "../store/useUserStore";

import CollapsibleHeader from "@/components/ui/CollapsibleHeader";
import Header from "@/components/ui/Header";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { router } from "expo-router";

export default function CollectionScreen() {
  const { profile } = useUserStore();
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsHeaderVisible(offsetY > 30);
  };

  return (
    <LinearGradient
      colors={["#e54545", "#000000", "#000000", "#1a1a1a"]}
      start={{ x: 1, y: 0 }}
      end={{ x: 1, y: 1 }}
      locations={[0, 0.3, 0.5, 1]}
      style={styles.container}
    >
      <CollapsibleHeader title="Collection" isVisible={isHeaderVisible} />
      <View style={styles.container}>
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <Header
            title="Collection"
            profilePicture={
              profile?.profilePicture || "https://via.placeholder.com/150"
            }
            isVisible={!isHeaderVisible}
          />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/collection/userCollection")}
          >
            <IconSymbol name="music.note.list" size={24} color="#e5411f" />
            <Text style={styles.menuText}>Collection</Text>
            <IconSymbol
              style={styles.button}
              name="chevron.right"
              size={16}
              color="grey"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/artist/userArtist")}
          >
            <IconSymbol name="person.2" size={24} color="#e5411f" />
            <Text style={styles.menuText}>Artists</Text>
            <IconSymbol
              style={styles.button}
              name="chevron.right"
              size={16}
              color="grey"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/forYou/userForyou")}
          >
            <IconSymbol name="star" size={24} color="#e5411f" />
            <Text style={styles.menuText}>Made for You</Text>
            <IconSymbol
              style={styles.button}
              name="chevron.right"
              size={16}
              color="grey"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/wishlist/userWishlist")}
          >
            <IconSymbol name="heart" size={24} color="#e5411f" />
            <Text style={styles.menuText}>Wishlist</Text>
            <IconSymbol
              style={styles.button}
              name="chevron.right"
              size={16}
              color="grey"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/genres/userGenres")}
          >
            <IconSymbol name="music.note" size={24} color="#e5411f" />
            <Text style={styles.menuText}>Genres</Text>
            <IconSymbol
              style={styles.button}
              name="chevron.right"
              size={16}
              color="grey"
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 80,
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 20,
  },
  menuText: {
    color: "white",
    fontSize: 16,
    marginLeft: 16,
  },
  button: {
    marginLeft: "auto",
  },
  recentlyAdded: {
    marginTop: 20,
  },
  recentlyAddedText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 20,
  },
});
