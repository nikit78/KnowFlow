import express from "express";

import {
  createCollection,
  getCollections,
  updateCollection,
  deleteCollection,
} from "../controllers/collectionController.js";

import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// Create Collection
// POST /api/collections
// ==========================
router.post("/", isAuthenticated, createCollection);

// ==========================
// Get All Collections
// GET /api/collections
// ==========================
router.get("/", isAuthenticated, getCollections);

// ==========================
// Update Collection
// PUT /api/collections/:id
// ==========================
router.put("/:id", isAuthenticated, updateCollection);

// ==========================
// Delete Collection
// DELETE /api/collections/:id
// ==========================
router.delete("/:id", isAuthenticated, deleteCollection);

export default router;