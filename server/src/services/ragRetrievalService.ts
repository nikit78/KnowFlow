import mongoose from "mongoose";

import { searchDocumentChunks } from "./documentSearchService.js";
import { buildRagContext } from "./ragContextService.js";

// ==========================
// Retrieve RAG Context
// ==========================

export const retrieveRagContext = async (
  userId: mongoose.Types.ObjectId,
  searchText: string,
  limit = 5
) => {
  // ==========================
  // Validate Search Text
  // ==========================

  if (!searchText || !searchText.trim()) {
    return {
      chunks: [],
      context: "",
    };
  }

  // ==========================
  // Search Relevant Chunks
  // ==========================

  const chunks = await searchDocumentChunks(
    userId,
    searchText.trim(),
    limit
  );

  // ==========================
  // Build RAG Context
  // ==========================

  const context = buildRagContext(chunks);

  // ==========================
  // Return Retrieval Result
  // ==========================

  return {
    chunks,
    context,
  };
};