import express from "express";

import {
  createCollection,
  getCollections,
  updateCollection,
  deleteCollection,
  addDocumentToCollection,
  removeDocumentFromCollection,
  getCollectionById,
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

router.get("/:id", isAuthenticated, getCollectionById);

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

router.post(
  "/:collectionId/documents/:documentId",
  isAuthenticated,
  addDocumentToCollection
);

router.delete(
  "/:collectionId/documents/:documentId",
  isAuthenticated,
  removeDocumentFromCollection
);

export default router;