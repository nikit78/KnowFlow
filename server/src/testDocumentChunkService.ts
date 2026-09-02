import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Document from "./models/Document.js";
import DocumentChunk from "./models/DocumentChunk.js";
import { createDocumentChunks } from "./services/documentChunkService.js";

// ==========================
// Load .env From Server Root
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
    // Find A Processed Document
    // ==========================

    const document =
      await Document.findOne({
        status: "processed",
        isDeleted: false,
      });

    if (!document) {
      console.log(
        "No processed document found"
      );

      return;
    }

    // ==========================
    // Document Information
    // ==========================

    console.log(
      "Document:",
      document.title
    );

    console.log(
      "Document ID:",
      document._id
    );

    console.log(
      "Extracted text length:",
      document.extractedText?.length || 0
    );

    // ==========================
    // Check Extracted Text
    // ==========================

    if (
      !document.extractedText ||
      !document.extractedText.trim()
    ) {
      console.log(
        "Document does not contain extracted text"
      );

      return;
    }

    // ==========================
    // Remove Existing Test Chunks
    // ==========================

    await DocumentChunk.deleteMany({
      document: document._id,
    });

    console.log(
      "Old chunks removed"
    );

    // ==========================
    // Create New Chunks
    // ==========================

    const chunks =
      await createDocumentChunks(
        document._id,
        document.user,
        document.extractedText
      );

    // ==========================
    // Result
    // ==========================

    console.log(
      "================================="
    );

    console.log(
      "Chunk creation successful!"
    );

    console.log(
      "================================="
    );

    console.log(
      "Total chunks:",
      chunks.length
    );

    console.log(
      "================================="
    );

    // ==========================
    // Show First 3 Chunks
    // ==========================

    chunks
      .slice(0, 3)
      .forEach((chunk) => {
        console.log(
          `Chunk ${chunk.chunkIndex}`
        );

        console.log(
          "Length:",
          chunk.text.length
        );

        console.log("Text:");

        console.log(
          chunk.text.slice(0, 300)
        );

        console.log(
          "---------------------------------"
        );
      });

  } catch (error) {
    console.error(
      "Chunk service test failed:",
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

// ==========================
// Start Test
// ==========================

runTest();