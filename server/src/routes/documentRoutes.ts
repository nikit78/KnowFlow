import express from "express";

import upload from "../config/multer.js";

import { isAuthenticated } from "../middleware/authMiddleware.js";

import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getTrashDocuments,
  restoreDocument,
  permanentDeleteDocument,
  searchDocuments,
  getDocumentSearchSuggestions,
  getDocumentStats,
  downloadDocument,
  previewDocument,
  toggleDocumentFavorite,
  getFavoriteDocuments,
  getDocumentsByTag,
  getDocumentsByType,
  getDocumentsByTypes,
  getDocumentsByStatus,
} from "../controllers/documentController.js";

const router = express.Router();

// ==========================
// Get All Documents
// GET /api/documents
// ==========================
router.get(
  "/",
  isAuthenticated,
  getDocuments
);

// ==========================
// Get Document Statistics
// GET /api/documents/stats
// ==========================
router.get(
  "/stats",
  isAuthenticated,
  getDocumentStats
);

// ==========================
// Get Trash Documents
// GET /api/documents/trash
// ==========================
router.get(
  "/trash",
  isAuthenticated,
  getTrashDocuments
);

// ==========================
// Search Documents
// GET /api/documents/search?q=
// ==========================
router.get(
  "/search",
  isAuthenticated,
  searchDocuments
);

// ==========================
// Search Suggestions
// GET /api/documents/search/suggestions?q=
// ==========================
router.get(
  "/search/suggestions",
  isAuthenticated,
  getDocumentSearchSuggestions
);

// ==========================
// Get Favorite Documents
// GET /api/documents/favorites
// ==========================
router.get(
  "/favorites",
  isAuthenticated,
  getFavoriteDocuments
);

// ==========================
// Get Documents By Tag
// GET /api/documents/tags?tag=
// ==========================
router.get(
  "/tags",
  isAuthenticated,
  getDocumentsByTag
);

// ==========================
// Get Documents By Type
// GET /api/documents/type?type=
// ==========================
router.get(
  "/type",
  isAuthenticated,
  getDocumentsByType
);

// ==========================
// Get Documents By Multiple Types
// GET /api/documents/types?types=
// ==========================
router.get(
  "/types",
  isAuthenticated,
  getDocumentsByTypes
);

// ==========================
// Get Documents By Status
// GET /api/documents/status?status=
// ==========================
router.get(
  "/status",
  isAuthenticated,
  getDocumentsByStatus
);

// ==========================
// Download Document
// GET /api/documents/:id/download
// ==========================
router.get(
  "/:id/download",
  isAuthenticated,
  downloadDocument
);

// ==========================
// Preview Document
// GET /api/documents/:id/preview
// ==========================
router.get(
  "/:id/preview",
  isAuthenticated,
  previewDocument
);

// ==========================
// Restore Document
// PATCH /api/documents/:id/restore
// ==========================
router.patch(
  "/:id/restore",
  isAuthenticated,
  restoreDocument
);

// ==========================
// Toggle Favorite
// PATCH /api/documents/:id/favorite
// ==========================
router.patch(
  "/:id/favorite",
  isAuthenticated,
  toggleDocumentFavorite
);

// ==========================
// Update Document
// PATCH /api/documents/:id
// ==========================
router.patch(
  "/:id",
  isAuthenticated,
  updateDocument
);

// ==========================
// Get Single Document
// GET /api/documents/:id
// ==========================
router.get(
  "/:id",
  isAuthenticated,
  getDocumentById
);

// ==========================
// Permanent Delete Document
// DELETE /api/documents/:id/permanent
// ==========================
router.delete(
  "/:id/permanent",
  isAuthenticated,
  permanentDeleteDocument
);

// ==========================
// Soft Delete Document
// DELETE /api/documents/:id
// ==========================
router.delete(
  "/:id",
  isAuthenticated,
  deleteDocument
);

// ==========================
// Upload Document
// POST /api/documents/upload
// ==========================
router.post(
  "/upload",
  isAuthenticated,
  upload.single("document"),
  uploadDocument
);

export default router;