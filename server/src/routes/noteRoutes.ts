import express from "express";

import {
  createNote,
  getNotes,
  getNoteById,
   updateNote,
   deleteNote,
   togglePinNote,
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

export default router;