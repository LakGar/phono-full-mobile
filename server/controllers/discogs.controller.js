import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const DISCOGS_API_URL = "https://api.discogs.com";
const DISCOGS_KEY = process.env.DISCOGS_CONSUMER_KEY;
const DISCOGS_SECRET = process.env.DISCOGS_CONSUMER_SECRET;

const headers = {
  "User-Agent": "Phono/1.0 +https://phono.app",
  Authorization: `Discogs key=${DISCOGS_KEY}, secret=${DISCOGS_SECRET}`,
};

// Helper function to handle Discogs API responses
const handleDiscogsResponse = async (response) => {
  const data = await response.json();

  // Check rate limiting headers
  console.log("Rate Limit:", {
    total: response.headers.get("X-Discogs-Ratelimit"),
    used: response.headers.get("X-Discogs-Ratelimit-Used"),
    remaining: response.headers.get("X-Discogs-Ratelimit-Remaining"),
  });

  if (!response.ok) {
    throw new Error(data.message || "Discogs API error");
  }

  return data;
};

export const searchArtists = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Add cache control headers
    res.set({
      "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      ETag: `"search-${q}"`, // ETag based on search query
    });

    // Build search query with better parameters
    const queryParams = new URLSearchParams({
      q: q,
      type: "artist",
      per_page: "50",
    }).toString();

    const response = await fetch(
      `${DISCOGS_API_URL}/database/search?${queryParams}`,
      {
        headers: {
          ...headers,
          Accept: "application/json",
        },
      }
    );

    const data = await handleDiscogsResponse(response);

    console.log("Search Results:", {
      query: q,
      totalResults: data.results?.length,
      pagination: data.pagination,
    });

    // Transform and clean the data with better filtering
    const artists = (data.results || [])
      .filter((artist) => {
        // Only filter out artists without any image
        return artist.thumb || artist.cover_image;
      })
      .map((artist) => ({
        id: artist.id.toString(),
        name: artist.title,
        image: artist.thumb || artist.cover_image,
        url: artist.resource_url,
        genre: artist.genre || [],
        style: artist.style || [],
      }))
      .slice(0, 20);

    console.log("Processed search results:", {
      totalArtists: artists.length,
      firstArtist: artists[0],
    });

    res.json({
      success: true,
      artists,
      pagination: data.pagination,
    });
  } catch (error) {
    console.error("Discogs API Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to search artists",
    });
  }
};

export const searchRecords = async (req, res) => {
  try {
    const { q, year, genre } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Add cache control headers with query params for unique caching
    res.set({
      "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      ETag: `"search-records-${q}-${year || ""}-${genre || ""}"`,
    });

    // Build search query with better parameters
    const queryParams = new URLSearchParams({
      q: q,
      type: "release",
      per_page: "50",
      format: "album,vinyl",
    });

    if (year) queryParams.append("year", year);
    if (genre) queryParams.append("genre", genre);

    const response = await fetch(
      `${DISCOGS_API_URL}/database/search?${queryParams}`,
      {
        headers: {
          ...headers,
          Accept: "application/json",
        },
      }
    );

    const data = await handleDiscogsResponse(response);

    console.log("Record Search Results:", {
      query: q,
      year,
      genre,
      totalResults: data.results?.length,
      pagination: data.pagination,
    });

    // Transform and clean the data with better filtering
    const records = (data.results || [])
      .filter((record) => {
        // Filter out records without images and ensure it's a proper release
        const hasValidImage = record.thumb || record.cover_image;
        const hasArtistAndTitle = record.title && record.title.includes(" - ");
        return hasValidImage && hasArtistAndTitle;
      })
      .map((record) => {
        const [artist, title] = record.title.split(" - ", 2);
        return {
          discogsId: record.id.toString(),
          name: title || record.title,
          artist: artist || "Unknown Artist",
          image: record.thumb || record.cover_image,
          year: record.year,
          genre: record.genre?.[0],
          style: record.style || [],
          format: record.format || [],
          country: record.country,
          url: record.resource_url,
          community: {
            have: record.community?.have || 0,
            want: record.community?.want || 0,
          },
        };
      })
      .slice(0, 20);

    console.log("Processed record results:", {
      totalRecords: records.length,
      firstRecord: records[0],
    });

    res.json({
      success: true,
      records,
      pagination: data.pagination,
    });
  } catch (error) {
    console.error("Discogs API Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to search records",
    });
  }
};

export const getPopularArtists = async (req, res) => {
  try {
    // Add cache control headers
    res.set({
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      ETag: '"popular-artists"',
    });

    const response = await fetch(
      `${DISCOGS_API_URL}/database/search?type=artist&sort=want&per_page=50`,
      {
        headers: {
          ...headers,
          Accept: "application/json",
        },
      }
    );

    const data = await handleDiscogsResponse(response);

    console.log("Discogs API Response:", {
      totalResults: data.results?.length,
      pagination: data.pagination,
      firstResult: data.results?.[0],
    });

    const artists = (data.results || [])
      .filter((artist) => artist.thumb || artist.cover_image)
      .map((artist) => ({
        id: artist.id.toString(),
        name: artist.title,
        image: artist.thumb || artist.cover_image,
        url: artist.resource_url,
        genre: artist.genre || [],
        style: artist.style || [],
      }))
      .slice(0, 20);

    res.json({
      success: true,
      artists,
      pagination: data.pagination,
    });
  } catch (error) {
    console.error("Discogs API Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch popular artists",
    });
  }
};

export const getPopularRecords = async (req, res) => {
  try {
    // Add cache control headers
    res.set({
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      ETag: '"popular-records"',
    });

    // Get records with high community engagement
    const queryParams = new URLSearchParams({
      type: "release",
      format: "album,vinyl",
      sort: "want",
      per_page: "50",
    }).toString();

    const response = await fetch(
      `${DISCOGS_API_URL}/database/search?${queryParams}`,
      {
        headers: {
          ...headers,
          Accept: "application/json",
        },
      }
    );

    const data = await handleDiscogsResponse(response);

    console.log("Popular Records Response:", {
      totalResults: data.results?.length,
      pagination: data.pagination,
    });

    const records = (data.results || [])
      .filter((record) => {
        // Filter out records without images and ensure it's a proper release
        const hasValidImage = record.thumb || record.cover_image;
        const hasArtistAndTitle = record.title && record.title.includes(" - ");
        return hasValidImage && hasArtistAndTitle;
      })
      .map((record) => {
        const [artist, title] = record.title.split(" - ", 2);
        return {
          discogsId: record.id.toString(),
          name: title || record.title,
          artist: artist || "Unknown Artist",
          image: record.thumb || record.cover_image,
          year: record.year,
          genre: record.genre?.[0],
          style: record.style || [],
          format: record.format || [],
          country: record.country,
          url: record.resource_url,
          community: {
            have: record.community?.have || 0,
            want: record.community?.want || 0,
          },
        };
      })
      .sort((a, b) => {
        // Sort by total community engagement (have + want)
        const aTotal = a.community.have + a.community.want;
        const bTotal = b.community.have + b.community.want;
        return bTotal - aTotal;
      })
      .slice(0, 20);

    res.json({
      success: true,
      records,
      pagination: data.pagination,
    });
  } catch (error) {
    console.error("Discogs API Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch popular records",
    });
  }
};

export const getAlbumsByGenres = async (req, res) => {
  try {
    const { genres } = req.query;

    if (!genres) {
      return res.status(400).json({
        success: false,
        message: "Genres parameter is required",
      });
    }

    // Add cache control headers
    res.set({
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      ETag: `"albums-by-genres-${genres}"`,
    });

    const genreArray = Array.isArray(genres) ? genres : [genres];

    // Fetch albums for each genre
    const albumPromises = genreArray.map(async (genre) => {
      try {
        const queryParams = new URLSearchParams({
          type: "release",
          genre: genre,
          format: "album",
          per_page: "50",
        }).toString();

        const response = await fetch(
          `${DISCOGS_API_URL}/database/search?${queryParams}`,
          {
            headers: {
              ...headers,
              Accept: "application/json",
            },
          }
        );

        const data = await handleDiscogsResponse(response);

        return (data.results || [])
          .filter((album) => album.thumb || album.cover_image)
          .map((album) => ({
            id: album.id.toString(),
            title: album.title,
            artist: album.artist,
            year: album.year,
            coverImage: album.thumb || album.cover_image,
            genre: album.genre?.[0] || "Unknown",
          }));
      } catch (error) {
        console.error(`Error fetching albums for genre ${genre}:`, error);
        return [];
      }
    });

    const results = await Promise.all(albumPromises);
    const albums = results.flat().slice(0, 20);

    res.json({
      success: true,
      albums,
    });
  } catch (error) {
    console.error("Error in getAlbumsByGenres:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch albums by genres",
    });
  }
};

export const getPopularAlbums = async (req, res) => {
  try {
    // Add cache control headers
    res.set({
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      ETag: '"popular-albums"',
    });

    const queryParams = new URLSearchParams({
      type: "release",
      format: "album",
      sort: "want",
      per_page: "50",
    }).toString();

    const response = await fetch(
      `${DISCOGS_API_URL}/database/search?${queryParams}`,
      {
        headers: {
          ...headers,
          Accept: "application/json",
        },
      }
    );

    const data = await handleDiscogsResponse(response);

    const albums = (data.results || [])
      .filter((album) => album.thumb || album.cover_image)
      .map((album) => ({
        id: album.id.toString(),
        title: album.title,
        artist: album.artist,
        year: album.year,
        coverImage: album.thumb || album.cover_image,
        genre: album.genre?.[0] || "Unknown",
      }))
      .slice(0, 20);

    res.json({
      success: true,
      albums,
    });
  } catch (error) {
    console.error("Error in getPopularAlbums:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular albums",
    });
  }
};

export const getAlbumDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://api.discogs.com/releases/${id}`, {
      headers: {
        Authorization: `Discogs key=${process.env.DISCOGS_KEY}, secret=${process.env.DISCOGS_SECRET}`,
        "User-Agent": "Phono/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Discogs API error: ${response.status}`);
    }

    const data = await response.json();

    // Format the response to match what the client expects
    const formattedAlbum = {
      id: data.id.toString(),
      title: data.title,
      artist: data.artists?.[0]?.name || "Unknown Artist",
      coverImage: data.images?.[0]?.uri || "",
      year: data.year,
      genre: data.genres?.[0] || "Unknown",
      description: data.notes || "",
      tracklist: data.tracklist?.map((track) => track.title) || [],
      format: data.formats?.[0]?.name || "",
      country: data.country || "",
      label: data.labels?.[0]?.name || "",
    };
    console.log("Album details:", formattedAlbum);
    res.json({
      success: true,
      album: formattedAlbum,
    });
  } catch (error) {
    console.error("Error fetching album details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch album details",
    });
  }
};

export const getArtistDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://api.discogs.com/artists/${id}`, {
      headers: {
        ...headers,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Discogs API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Artist details:", data);
    res.json({
      success: true,
      artist: data,
    });
  } catch (error) {
    console.error("Error fetching artist details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch artist details",
    });
  }
};

export const searchByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: "Barcode is required",
      });
    }

    const params = new URLSearchParams({
      barcode,
      key: DISCOGS_KEY,
      secret: DISCOGS_SECRET,
      per_page: "50",
    });

    const url = `${DISCOGS_API_URL}/database/search?${params}`;
    console.log("Discogs search URL:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Phono/1.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("Discogs error status:", response.status);
      throw new Error(`Discogs API error ${response.status}`);
    }

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];

    if (results.length === 0) {
      return res.json({
        success: true,
        record: null,
      });
    }

    const record = results[0];
    const formattedRecord = {
      id: record.id.toString(),
      title: record.title,
      artist: record.artist,
      cover_image: record.cover_image,
      year: record.year,
      genre: record.genre?.[0],
      style: record.style || [],
      format: record.format || [],
      country: record.country,
      url: record.resource_url,
      community: {
        have: record.community?.have || 0,
        want: record.community?.want || 0,
      },
    };

    res.json({
      success: true,
      record: formattedRecord,
    });
  } catch (error) {
    console.error("Discogs API Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to search by barcode",
    });
  }
};

export const getNewReleases = async (req, res) => {
  try {
    res.set({
      "Cache-Control": "public, max-age=3600",
      ETag: '"new-releases"',
    });

    const queryParams = new URLSearchParams({
      type: "release",
      format: "album,vinyl",
      sort: "date_added",
      per_page: "50",
    }).toString();

    const response = await fetch(
      `${DISCOGS_API_URL}/database/search?${queryParams}`,
      {
        headers: {
          ...headers,
          Accept: "application/json",
        },
      }
    );

    const data = await handleDiscogsResponse(response);

    const releases = (data.results || [])
      .filter((release) => release.thumb || release.cover_image)
      .map((release) => ({
        id: release.id.toString(),
        title: release.title,
        artist: release.artist,
        coverImage: release.thumb || release.cover_image,
        year: release.year,
        genre: release.genre?.[0] || "Unknown",
        format: release.format?.[0] || "Unknown",
      }))
      .slice(0, 20);

    res.json({
      success: true,
      releases,
    });
  } catch (error) {
    console.error("Error in getNewReleases:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch new releases",
    });
  }
};

export const getTrendingArtists = async (req, res) => {
  try {
    res.set({
      "Cache-Control": "public, max-age=3600",
      ETag: '"trending-artists"',
    });

    const queryParams = new URLSearchParams({
      type: "artist",
      sort: "want",
      per_page: "50",
    }).toString();

    console.log("Fetching trending artists with params:", queryParams);

    const response = await fetch(
      `${DISCOGS_API_URL}/database/search?${queryParams}`,
      {
        headers: {
          ...headers,
          Accept: "application/json",
        },
      }
    );

    const data = await handleDiscogsResponse(response);
    console.log("Raw trending artists response:", {
      totalResults: data.results?.length,
      firstResult: data.results?.[0],
      pagination: data.pagination,
    });

    const artists = (data.results || [])
      .filter((artist) => {
        const hasImage = artist.thumb || artist.cover_image;
        console.log("Artist image check:", {
          id: artist.id,
          name: artist.title,
          hasImage,
          thumb: artist.thumb,
          coverImage: artist.cover_image,
        });
        return hasImage;
      })
      .map((artist) => ({
        id: artist.id.toString(),
        name: artist.title,
        image: artist.thumb || artist.cover_image,
        genre: artist.genre?.[0] || "Unknown",
        style: artist.style || [],
      }))
      .slice(0, 20);

    console.log("Processed trending artists:", {
      totalArtists: artists.length,
      firstArtist: artists[0],
      lastArtist: artists[artists.length - 1],
    });

    res.json({
      success: true,
      artists,
    });
  } catch (error) {
    console.error("Error in getTrendingArtists:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trending artists",
    });
  }
};

export const getFeaturedCollections = async (req, res) => {
  try {
    res.set({
      "Cache-Control": "public, max-age=3600",
      ETag: '"featured-collections"',
    });

    // Fetch different types of collections
    const [popularAlbums, newReleases, trendingArtists] = await Promise.all([
      fetch(
        `${DISCOGS_API_URL}/database/search?type=release&format=album,vinyl&sort=want&per_page=20`,
        {
          headers: { ...headers, Accept: "application/json" },
        }
      ),
      fetch(
        `${DISCOGS_API_URL}/database/search?type=release&format=album,vinyl&sort=date_added&per_page=20`,
        {
          headers: { ...headers, Accept: "application/json" },
        }
      ),
      fetch(
        `${DISCOGS_API_URL}/database/search?type=artist&sort=want&per_page=20`,
        {
          headers: { ...headers, Accept: "application/json" },
        }
      ),
    ]);

    const [popularData, newData, trendingData] = await Promise.all([
      handleDiscogsResponse(popularAlbums),
      handleDiscogsResponse(newReleases),
      handleDiscogsResponse(trendingArtists),
    ]);

    const collections = [
      {
        id: "popular",
        title: "Most Wanted",
        type: "album",
        items: (popularData.results || []).map((item) => ({
          id: item.id.toString(),
          title: item.title,
          artist: item.artist,
          coverImage: item.thumb || item.cover_image,
        })),
      },
      {
        id: "new",
        title: "New Releases",
        type: "album",
        items: (newData.results || []).map((item) => ({
          id: item.id.toString(),
          title: item.title,
          artist: item.artist,
          coverImage: item.thumb || item.cover_image,
        })),
      },
      {
        id: "artists",
        title: "Trending Artists",
        type: "artist",
        items: (trendingData.results || []).map((item) => ({
          id: item.id.toString(),
          name: item.title,
          image: item.thumb || item.cover_image,
        })),
      },
    ];

    res.json({
      success: true,
      collections,
    });
  } catch (error) {
    console.error("Error in getFeaturedCollections:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured collections",
    });
  }
};

export const getEditorPicks = async (req, res) => {
  try {
    res.set({
      "Cache-Control": "public, max-age=3600",
      ETag: '"editor-picks"',
    });

    const queryParams = new URLSearchParams({
      type: "release",
      format: "album,vinyl",
      sort: "want",
      per_page: "50",
    }).toString();

    const response = await fetch(
      `${DISCOGS_API_URL}/database/search?${queryParams}`,
      {
        headers: {
          ...headers,
          Accept: "application/json",
        },
      }
    );

    const data = await handleDiscogsResponse(response);

    const picks = (data.results || [])
      .filter((pick) => pick.thumb || pick.cover_image)
      .map((pick) => ({
        id: pick.id.toString(),
        title: pick.title,
        artist: pick.artist,
        coverImage: pick.thumb || pick.cover_image,
        year: pick.year,
        genre: pick.genre?.[0] || "Unknown",
        description: pick.notes || "",
      }))
      .slice(0, 20);

    res.json({
      success: true,
      picks,
    });
  } catch (error) {
    console.error("Error in getEditorPicks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch editor picks",
    });
  }
};

export const getGenreHighlights = async (req, res) => {
  try {
    res.set({
      "Cache-Control": "public, max-age=3600",
      ETag: '"genre-highlights"',
    });

    const genres = ["Rock", "Jazz", "Hip Hop", "Electronic", "Classical"];
    const genrePromises = genres.map((genre) =>
      fetch(
        `${DISCOGS_API_URL}/database/search?type=release&genre=${genre}&format=album,vinyl&sort=want&per_page=20`,
        {
          headers: { ...headers, Accept: "application/json" },
        }
      )
    );

    const responses = await Promise.all(genrePromises);
    const data = await Promise.all(
      responses.map((res) => handleDiscogsResponse(res))
    );

    const highlights = genres.map((genre, index) => ({
      genre,
      items: (data[index].results || [])
        .filter((item) => {
          // Filter out items without proper images
          const hasValidImage = item.thumb || item.cover_image;
          // Filter out items without proper title format
          const hasValidTitle = item.title && item.title.includes(" - ");
          return hasValidImage && hasValidTitle;
        })
        .map((item) => {
          const [artist, title] = item.title.split(" - ", 2);
          return {
            id: item.id.toString(),
            title: item.title,
            artist: artist || "Unknown Artist",
            coverImage: item.thumb || item.cover_image,
            year: item.year || "",
            community: {
              have: item.community?.have || 0,
              want: item.community?.want || 0,
            },
          };
        })
        .sort((a, b) => b.community.want - a.community.want) // Sort by most wanted
        .slice(0, 10), // Take top 10 most wanted
    }));

    res.json({
      success: true,
      highlights,
    });
  } catch (error) {
    console.error("Error in getGenreHighlights:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch genre highlights",
    });
  }
};

export const getArtistReleases = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, per_page = 20 } = req.query;

    const response = await fetch(
      `https://api.discogs.com/artists/${id}/releases?page=${page}&per_page=${per_page}`,
      {
        headers: {
          Authorization: `Discogs key=${process.env.DISCOGS_CONSUMER_KEY}, secret=${process.env.DISCOGS_CONSUMER_SECRET}`,
          "User-Agent": "Phono/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Discogs API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter out releases without proper images and format the data
    const releases = data.releases
      .filter(
        (release) => release.thumb && !release.thumb.includes("spacer.gif")
      )
      .map((release) => ({
        id: release.id,
        title: release.title,
        year: release.year,
        format: release.format,
        label: release.label,
        thumb: release.thumb,
        type: release.type,
        stats: release.stats,
      }));

    res.json({
      success: true,
      releases,
      pagination: data.pagination,
    });
  } catch (error) {
    console.error("Error fetching artist releases:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch artist releases",
      error: error.message,
    });
  }
};
