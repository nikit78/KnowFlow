import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { generateEmbedding } from "./services/embeddingService.js";

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
    // Check API Key
    // ==========================

    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is not loaded from server/.env"
      );
    }

    console.log(
      "OpenAI API key loaded successfully"
    );

    // ==========================
    // Test Text
    // ==========================

    const text =
      "Java is an object-oriented programming language.";

    console.log(
      "Starting embedding test..."
    );

    // ==========================
    // Generate Embedding
    // ==========================

    const embedding =
      await generateEmbedding(text);

    // ==========================
    // Result
    // ==========================

    console.log(
      "================================="
    );

    console.log(
      "Embedding generation successful!"
    );

    console.log(
      "================================="
    );

    console.log(
      "Input text:",
      text
    );

    console.log(
      "Embedding dimensions:",
      embedding.length
    );

    console.log(
      "First 10 values:"
    );

    console.log(
      embedding.slice(0, 10)
    );

    console.log(
      "================================="
    );

  } catch (error) {
    console.error(
      "Embedding test failed:",
      error
    );
  }
};

// ==========================
// Start Test
// ==========================

runTest();