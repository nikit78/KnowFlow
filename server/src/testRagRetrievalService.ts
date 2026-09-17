import "dotenv/config";
import mongoose from "mongoose";

import "./models/Document.js";

import { retrieveRagContext } from "./services/ragRetrievalService.js";
import { connectDatabase } from "./config/database.js";


await connectDatabase();

// ==========================
// Test RAG Retrieval Service
// ==========================

const userId =
  new mongoose.Types.ObjectId(
    "6a6e223ab132039c91d17f6a"
  );

const searchQuery = "React";

console.log("=================================");
console.log("RAG Retrieval Service Test");
console.log("=================================");

const result = await retrieveRagContext(
  userId,
  searchQuery,
  5
);

console.log("Search Query:", searchQuery);
console.log("Chunks Found:", result.chunks.length);

console.log("---------------------------------");
console.log("RAG Context");
console.log("---------------------------------");

console.log(result.context);

console.log("=================================");
console.log(
  "Context Length:",
  result.context.length
);
console.log("=================================");

// ==========================
// Basic Validation
// ==========================

if (result.chunks.length === 0) {
  throw new Error(
    "No chunks were retrieved"
  );
}

if (!result.context) {
  throw new Error(
    "RAG context is empty"
  );
}

if (!result.context.includes("[Context 1]")) {
  throw new Error(
    "Context 1 is missing"
  );
}

if (!result.context.includes("React")) {
  throw new Error(
    "Search result content is missing"
  );
}

console.log(
  "RAG Retrieval Service test completed successfully."
);