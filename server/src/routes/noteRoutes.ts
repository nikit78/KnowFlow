import express from "express";

import {
  createNote,
  getNotes,
  searchNotes,
  getTrashNotes,
  restoreNote,
  permanentDeleteNote,
  getNoteById,
  updateNote,
  deleteNote,
  togglePinNote,
  toggleFavoriteNote,
  getRecentSearches,
  getSearchSuggestions,

} from "../controllers/noteController.js";

import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// Create Note
// POST /api/notes
// ==========================
router.post("/", isAuthenticated, createNote);

// ==========================
// Get All Notes
// GET /api/notes
// ==========================
router.get("/", isAuthenticated, getNotes);

// ==========================
// Search Notes
// GET /api/notes/search?q=react
// ==========================
router.get("/search", isAuthenticated, searchNotes);

// ==========================
// Get Trash Notes
// GET /api/notes/trash
// ==========================
router.get("/trash", isAuthenticated, getTrashNotes);

// ==========================
// Recent Searches
// GET /api/notes/search/history
// ==========================
router.get(
  "/search/history",
  isAuthenticated,
  getRecentSearches
);

// ==========================
// Search Suggestions
// GET /api/notes/search/suggestions
// ==========================
router.get(
  "/search/suggestions",
  isAuthenticated,
  getSearchSuggestions
);

// ==========================
// Restore Note
// PATCH /api/notes/:id/restore
// ==========================
router.patch("/:id/restore", isAuthenticated, restoreNote);

// ==========================
// Permanent Delete
// DELETE /api/notes/:id/permanent
// ==========================
router.delete(
  "/:id/permanent",
  isAuthenticated,
  permanentDeleteNote
);

// ==========================
// Get Single Note
// GET /api/notes/:id
// ==========================
router.get("/:id", isAuthenticated, getNoteById);

// ==========================
// Update Note
// PUT /api/notes/:id
// ==========================
router.put("/:id", isAuthenticated, updateNote);

// ==========================
// Delete Note
// DELETE /api/notes/:id
// ==========================
router.delete("/:id", isAuthenticated, deleteNote);

router.patch("/:id/pin", isAuthenticated, togglePinNote);

// ==========================
// Toggle Favorite
// PATCH /api/notes/:id/favorite
// ==========================
router.patch(
  "/:id/favorite",
  isAuthenticated,
  toggleFavoriteNote
);

export default router;