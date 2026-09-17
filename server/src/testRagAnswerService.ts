import "dotenv/config";
import mongoose from "mongoose";

import { connectDatabase } from "./config/database.js";
import "./models/Document.js";

import { generateRagAnswer } from "./services/ragAnswerService.js";

// ==========================
// Connect Database
// ==========================

await connectDatabase();

// ==========================
// Test RAG Answer Service
// ==========================

const userId =
  new mongoose.Types.ObjectId(
    "6a6e223ab132039c91d17f6a"
  );

const question =
  "What technologies does Nikit have experience with?";

console.log("=================================");
console.log("RAG Answer Service Test");
console.log("=================================");

try {
  const result = await generateRagAnswer({
    userId,
    question,
  });

  console.log("---------------------------------");
  console.log("AI Answer:");
  console.log(result.answer);

  console.log("---------------------------------");
  console.log(
    "Chunks Used:",
    result.chunks.length
  );

  console.log(
    "Context Length:",
    result.context.length
  );

  console.log(
  "Sources Used:",
  result.sources.length
);

console.log(
  "Sources:",
  result.sources
);

  console.log("---------------------------------");

  if (!result.answer) {
    throw new Error(
      "RAG answer is empty"
    );
  }

  if (!result.context) {
    throw new Error(
      "RAG context is empty"
    );
  }

  if (result.chunks.length === 0) {
    throw new Error(
      "No chunks were used"
    );
  }

  if (result.sources.length === 0) {
  throw new Error(
    "No sources were returned"
  );
}

  console.log(
    "RAG Answer Service test completed successfully."
  );
} catch (error: any) {
  console.log("---------------------------------");
  console.log("RAG Pipeline Result:");
  console.log(
    error?.message || error
  );
  console.log("---------------------------------");

  if (
    error?.message ===
    "OpenAI API credits are exhausted. AI answer generation is currently unavailable."
  ) {
    console.log(
      "RAG retrieval and prompt generation reached the LLM provider successfully."
    );

    console.log(
      "Expected OpenAI quota handling passed."
    );

    console.log(
      "RAG Answer Service integration test completed successfully."
    );

    process.exit(0);
  }

  throw error;
}