import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import DocumentChunk from "./models/DocumentChunk.js";
import { searchDocumentChunks } from "./services/documentSearchService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const testSearch = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("MongoDB connected successfully");
    console.log("=================================");

    const firstChunk = await DocumentChunk.findOne().lean();

    if (!firstChunk) {
      console.log("No document chunks found.");
      return;
    }

    console.log("Using User ID:", firstChunk.user.toString());
    console.log("Search Query: React");
    console.log("=================================");

    const results = await searchDocumentChunks(
      firstChunk.user,
      "React",
      5
    );

    console.log("Search Results:", results.length);
    console.log("=================================");

    results.forEach((result, index) => {
      console.log(`Result ${index + 1}`);
      console.log("Document:", result.document.toString());
      console.log("Chunk Index:", result.chunkIndex);
      console.log("Text:", result.text.substring(0, 200));
      console.log("---------------------------------");
    });

    console.log("Document search test completed successfully.");
  } catch (error) {
    console.error("Document search test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

testSearch();