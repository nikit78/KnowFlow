import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import DocumentChunk from "./models/DocumentChunk.js";
import { getDocumentChunks } from "./services/documentRetrievalService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const testRetrieval = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("MongoDB connected successfully");
    console.log("=================================");

    const firstChunk = await DocumentChunk.findOne().lean();

    if (!firstChunk) {
      console.log("No document chunks found.");
      return;
    }

    const userId = firstChunk.user;
    const documentId = firstChunk.document;

    console.log("Valid User ID:", userId.toString());
    console.log("Valid Document ID:", documentId.toString());

    // Test 1: Valid user + valid document
    const validResults = await getDocumentChunks(
      userId,
      documentId
    );

    console.log(
      "Test 1 - Valid IDs:",
      validResults.length,
      "chunks"
    );

    // Test 2: Invalid user ID
    const invalidUserResults =
      await getDocumentChunks(
        "invalid-user-id" as unknown as mongoose.Types.ObjectId,
        documentId
      );

    console.log(
      "Test 2 - Invalid User ID:",
      invalidUserResults.length,
      "chunks"
    );

    // Test 3: Invalid document ID
    const invalidDocumentResults =
      await getDocumentChunks(
        userId,
        "invalid-document-id" as unknown as mongoose.Types.ObjectId
      );

    console.log(
      "Test 3 - Invalid Document ID:",
      invalidDocumentResults.length,
      "chunks"
    );

    // Test 4: Valid-looking but different user ID
    const differentUserId =
      new mongoose.Types.ObjectId();

    const unauthorizedResults =
      await getDocumentChunks(
        differentUserId,
        documentId
      );

    console.log(
      "Test 4 - Different User:",
      unauthorizedResults.length,
      "chunks"
    );

    console.log("=================================");
    console.log(
      "Retrieval validation test completed successfully."
    );
  } catch (error) {
    console.error(
      "Retrieval validation test failed:",
      error
    );
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

testRetrieval();