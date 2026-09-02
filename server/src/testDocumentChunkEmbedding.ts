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
// Run Test
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
    // Get Existing Chunks
    // ==========================

    const chunks =
      await DocumentChunk.find({})
        .sort({
          chunkIndex: 1,
        })
        .limit(5);

    console.log(
      "Total chunks found:",
      chunks.length
    );

    // ==========================
    // Check Embedding Field
    // ==========================

    chunks.forEach((chunk) => {
      console.log(
        "================================="
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
        "Embedding Exists:",
        Array.isArray(chunk.embedding)
      );

      console.log(
        "Embedding Length:",
        chunk.embedding.length
      );
    });

    console.log(
      "================================="
    );

    console.log(
      "DocumentChunk embedding field test successful!"
    );

  } catch (error) {
    console.error(
      "DocumentChunk embedding test failed:",
      error
    );
  } finally {
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