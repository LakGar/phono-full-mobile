import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  searchArtists,
  searchRecords,
  getPopularArtists,
  getPopularRecords,
  getAlbumsByGenres,
  getPopularAlbums,
  getAlbumDetails,
  searchByBarcode,
  getArtistDetails,
  getNewReleases,
  getTrendingArtists,
  getFeaturedCollections,
  getEditorPicks,
  getGenreHighlights,
  getArtistReleases,
} from "../controllers/discogs.controller.js";

const router = express.Router();

// Artist routes
router.get("/artists/search", authenticate, searchArtists);
router.get("/artists/popular", authenticate, getPopularArtists);
router.get("/artists/trending", authenticate, getTrendingArtists);
router.get("/artists/details/:id", authenticate, getArtistDetails);
router.get("/artists/releases/:id", authenticate, getArtistReleases);

// Record routes
router.get("/records/search", authenticate, searchRecords);
router.get("/records/popular", authenticate, getPopularRecords);
router.get("/records/barcode/:barcode", authenticate, searchByBarcode);

// Album routes
router.get("/albums/by-genres", authenticate, getAlbumsByGenres);
router.get("/albums/popular", authenticate, getPopularAlbums);
router.get("/albums/new-releases", authenticate, getNewReleases);
router.get("/albums/editor-picks", authenticate, getEditorPicks);
router.get("/albums/:id", authenticate, getAlbumDetails);

// Explore routes
router.get("/explore/featured", authenticate, getFeaturedCollections);
router.get("/explore/genre-highlights", authenticate, getGenreHighlights);

export default router;
