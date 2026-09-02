import DocumentChunk from "../models/DocumentChunk.js";

import { generateEmbedding } from "./embeddingService.js";

// ==========================
// Generate Missing Embeddings
// ==========================

export const generateMissingEmbeddings =
  async () => {
    // ==========================
    // Find Chunks Without Embeddings
    // ==========================

    const chunks =
      await DocumentChunk.find({
        $or: [
          {
            embedding: {
              $exists: false,
            },
          },
          {
            embedding: {
              $size: 0,
            },
          },
        ],
      }).sort({
        createdAt: 1,
      });

    console.log(
      `Found ${chunks.length} chunks without embeddings`
    );

    let successCount = 0;
    let failedCount = 0;

    // ==========================
    // Generate Embeddings
    // ==========================

    for (const chunk of chunks) {
      try {
        const embedding =
          await generateEmbedding(
            chunk.text
          );

        chunk.embedding = embedding;

        await chunk.save();

        successCount++;

        console.log(
          `Embedding generated for chunk ${chunk.chunkIndex}`
        );
      } catch (error: any) {
        failedCount++;

        console.warn(
          `Embedding failed for chunk ${chunk.chunkIndex}:`,
          error?.message || error
        );

        // Continue with next chunk
        continue;
      }
    }

    // ==========================
    // Result
    // ==========================

    console.log(
      "================================="
    );

    console.log(
      "Embedding retry completed"
    );

    console.log(
      "Total chunks:",
      chunks.length
    );

    console.log(
      "Successful:",
      successCount
    );

    console.log(
      "Failed:",
      failedCount
    );

    console.log(
      "================================="
    );

    return {
      total: chunks.length,
      success: successCount,
      failed: failedCount,
    };
  };