import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import DocumentChunk from "./models/DocumentChunk.js";

// ==========================
// Load .env
// ==========================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// ==========================
// Run Dry Test
// ==========================

const runTest = async () => {
  try {
    // ==========================
    // Check MongoDB URI
    // ==========================

    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not loaded from server/.env"
      );
    }

    // ==========================
    // Connect MongoDB
    // ==========================

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log("MongoDB connected");

    // ==========================
    // Find Missing Embeddings
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
      })
        .sort({
          createdAt: 1,
        })
        .limit(20);

    // ==========================
    // Result
    // ==========================

    console.log(
      "================================="
    );

    console.log(
      "Embedding Retry Dry Run"
    );

    console.log(
      "Chunks without embeddings:",
      chunks.length
    );

    console.log(
      "================================="
    );

    chunks.forEach((chunk, index) => {
      console.log(
        `Chunk ${index + 1}`
      );

      console.log(
        "Document:",
        chunk.document.toString()
      );

      console.log(
        "Chunk Index:",
        chunk.chunkIndex
      );

      console.log(
        "Text Length:",
        chunk.text.length
      );

      console.log(
        "Embedding Length:",
        chunk.embedding.length
      );

      console.log(
        "---------------------------------"
      );
    });

    console.log(
      "Dry run successful!"
    );

  } catch (error) {
    console.error(
      "Embedding retry dry run failed:",
      error
    );
  } finally {
    // ==========================
    // Disconnect MongoDB
    // ==========================

    if (
      mongoose.connection.readyState !== 0
    ) {
      await mongoose.disconnect();
    }

    console.log(
      "MongoDB disconnected"
    );
  }
};

runTest();