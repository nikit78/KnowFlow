import mongoose from "mongoose";

import DocumentChunk from "../models/DocumentChunk.js";

import { chunkDocumentText } from "./documentChunkingService.js";

import { generateEmbedding } from "./embeddingService.js";

// ==========================
// Create Chunks For Document
// ==========================

export const createDocumentChunks = async (
  documentId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  extractedText: string
) => {
  // ==========================
  // Check Text
  // ==========================

  if (!extractedText || !extractedText.trim()) {
    return [];
  }

  // ==========================
  // Convert Text Into Chunks
  // ==========================

  const chunks = chunkDocumentText(
    extractedText
  );

  // ==========================
  // Prepare Chunk Documents
  // ==========================

  const chunkDocuments = chunks.map(
    (text, index) => ({
      document: documentId,
      user: userId,
      chunkIndex: index,
      text,
      embedding: [] as number[],
    })
  );

  // ==========================
  // Check Chunks
  // ==========================

  if (chunkDocuments.length === 0) {
    return [];
  }

  // ==========================
  // Save Chunks First
  // ==========================

  const savedChunks =
    await DocumentChunk.insertMany(
      chunkDocuments
    );

  console.log(
    `Created ${savedChunks.length} chunks for document ${documentId}`
  );

  // ==========================
  // Generate Embeddings
  // ==========================

  for (const chunk of savedChunks) {
    try {
      const embedding =
        await generateEmbedding(
          chunk.text
        );

      chunk.embedding = embedding;

      await chunk.save();

      console.log(
        `Embedding created for chunk ${chunk.chunkIndex}`
      );
    } catch (error: any) {
      console.warn(
        `Embedding generation skipped for chunk ${chunk.chunkIndex}:`,
        error?.message || error
      );

      // ==========================
      // Important
      // ==========================
      // Do NOT delete the chunk.
      // Do NOT fail document processing.
      // Embedding can be generated later.
    }
  }

  // ==========================
  // Return Chunks
  // ==========================

  return savedChunks;
};