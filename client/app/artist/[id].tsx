import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  FlatList,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showToast } from "../../config/toast";
import { IconSymbol } from "../../components/ui/IconSymbol";

interface Release {
  id: number;
  title: string;
  year: number;
  format: string;
  label: string;
  thumb: string;
  type: string;
  stats?: {
    community: {
      in_wantlist: number;
      in_collection: number;
    };
  };
}

interface Artist {
  name: string;
  profile?: string;
  images?: Array<{
    type: string;
    uri: string;
    resource_url: string;
    uri150: string;
    width: number;
    height: number;
  }>;
  members?: Array<{
    id: number;
    name: string;
    resource_url: string;
    active: boolean;
  }>;
  urls?: string[];
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 50) / 2; // 2 columns with 20px padding

export default function ArtistDetail() {
  const { id } = useLocalSearchParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullBio, setShowFullBio] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchArtistDetails();
    fetchReleases();
  }, [id]);

  const fetchArtistDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_URL}/discogs/artists/details/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch artist details: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setArtist(data.artist);
      } else {
        throw new Error(data.message || "Failed to fetch artist details");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching artist details:", error);
      setError(error.message);
      showToast("error", "Error", error.message);
    }
  };

  const fetchReleases = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${API_URL}/discogs/artists/releases/${id}?page=${page}&per_page=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch releases: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const newReleases = data.releases
          .filter(
            (release: Release) =>
              release.thumb &&
              !release.thumb.includes("spacer.gif") &&
              !releases.some((r) => r.id === release.id)
          )
          .map((release: Release) => ({
            id: release.id,
            title: release.title,
            year: release.year,
            format: release.format,
            label: release.label,
            thumb: release.thumb,
            type: release.type,
            stats: release.stats,
          }));

        setReleases((prev) => [...prev, ...newReleases]);
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching releases:", error);
      showToast("error", "Error", "Failed to load releases");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
      fetchReleases();
    }
  };

  const toggleBio = () => {
    setShowFullBio(!showFullBio);
  };

  const renderAlbum = ({ item }: { item: Release }) => (
    <TouchableOpacity
      style={styles.albumCard}
      onPress={() => router.push(`/record/${item.id}`)}
    >
      <Image
        source={{ uri: item.thumb || "https://via.placeholder.com/300" }}
        style={styles.albumImage}
      />
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.albumYear}>{item.year}</Text>
        <Text style={styles.albumFormat} numberOfLines={1}>
          {item.format}
        </Text>
        {item.stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <IconSymbol name="heart" size={12} color="#666" />
              <Text style={styles.statText}>
                {item.stats.community.in_wantlist}
              </Text>
            </View>
            <View style={styles.statItem}>
              <IconSymbol name="square.stack" size={12} color="#666" />
              <Text style={styles.statText}>
                {item.stats.community.in_collection}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !artist) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e54545" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            fetchArtistDetails();
            fetchReleases();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Artist not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{artist.name}</Text>
        </View>

        <View style={styles.artistInfo}>
          {artist.images && artist.images[0] && (
            <Image
              source={{ uri: artist.images[0].uri }}
              style={styles.artistImage}
            />
          )}
          <Text style={styles.artistName}>{artist.name}</Text>

          {artist.profile && (
            <View style={styles.bioContainer}>
              <Text
                style={styles.artistBio}
                numberOfLines={showFullBio ? undefined : 3}
              >
                {artist.profile}
              </Text>
              {artist.profile.length > 200 && (
                <TouchableOpacity onPress={toggleBio}>
                  <Text style={styles.readMore}>
                    {showFullBio ? "Read Less" : "Read More"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.albumsSection}>
          <Text style={[styles.sectionTitle, { paddingLeft: 20 }]}>
            Discography
          </Text>

          <FlatList
            data={releases}
            renderItem={renderAlbum}
            keyExtractor={(item) => `release-${item.id}`}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.albumsList}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading ? (
                <ActivityIndicator
                  size="small"
                  color="#e54545"
                  style={styles.loadingMore}
                />
              ) : null
            }
          />
        </View>

        {artist.members && artist.members.length > 0 && (
          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>Members</Text>
            {artist.members.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.memberItem}
                onPress={() => router.push(`/artist/${member.id}`)}
              >
                <Text style={styles.memberName}>{member.name}</Text>
                <IconSymbol name="chevron.right" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {artist.urls && artist.urls.length > 0 && (
          <View style={styles.linksSection}>
            <Text style={styles.sectionTitle}>Links</Text>
            {artist.urls.map((url, index) => (
              <TouchableOpacity
                key={index}
                style={styles.linkItem}
                onPress={() => Linking.openURL(url)}
              >
                <Text style={styles.linkText}>{url}</Text>
                <IconSymbol name="arrow.up.right" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginTop: 40,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  artistInfo: {
    alignItems: "center",
    padding: 20,
  },
  artistImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  artistName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  bioContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  artistBio: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 10,
  },
  readMore: {
    color: "#e54545",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  membersSection: {
    padding: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  memberName: {
    color: "#fff",
    fontSize: 16,
  },
  albumsSection: {},
  albumsList: {
    paddingHorizontal: 20,
  },
  albumCard: {
    width: CARD_WIDTH,
    overflow: "hidden",
    marginRight: 20,
  },
  albumImage: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
  },
  albumInfo: {
    padding: 8,
  },
  albumTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  albumYear: {
    color: "#666",
    fontSize: 12,
    marginBottom: 2,
  },
  albumFormat: {
    color: "#666",
    fontSize: 12,
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    color: "#666",
    fontSize: 12,
    marginLeft: 4,
  },
  loadingMore: {
    marginVertical: 20,
  },
  linksSection: {
    padding: 20,
  },
  linkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  linkText: {
    color: "#666",
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
});
