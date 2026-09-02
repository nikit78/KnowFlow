import mongoose from "mongoose";

import DocumentChunk from "../models/DocumentChunk.js";

// ==========================
// Search Document Chunks
// ==========================

export const searchDocumentChunks = async (
  userId: mongoose.Types.ObjectId,
  searchText: string,
  limit = 5
) => {
  // ==========================
  // Validate Search Text
  // ==========================

  if (!searchText || !searchText.trim()) {
    return [];
  }

  // ==========================
  // Safe Limit
  // ==========================

  const safeLimit = Math.min(
    Math.max(limit, 1),
    20
  );

  // ==========================
  // Search User's Chunks
  // ==========================

  const chunks =
    await DocumentChunk.find({
      user: userId,
      $text: {
        $search: searchText.trim(),
      },
    })
      .select(
        "document chunkIndex text"
      )
      .limit(safeLimit)
      .lean();

  // ==========================
  // Return Results
  // ==========================

  return chunks;
};