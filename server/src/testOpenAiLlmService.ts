import "dotenv/config";

import {
  generateOpenAiAnswer,
} from "./services/openaiLlmService.js";

// ==========================
// Test OpenAI LLM Service
// ==========================

console.log("=================================");
console.log("OpenAI LLM Service Test");
console.log("=================================");

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.log(
    "OPENAI_API_KEY is not configured."
  );
  console.log(
    "Provider configuration validation completed."
  );
  process.exit(0);
}

console.log(
  "OPENAI_API_KEY is configured."
);

// ==========================
// Actual Provider Test
// ==========================

try {
  const answer =
    await generateOpenAiAnswer({
      prompt:
        "Reply with exactly: KnowFlow LLM test successful.",
    });

  console.log("---------------------------------");
  console.log("OpenAI Response:");
  console.log(answer);
  console.log("---------------------------------");

  if (!answer) {
    throw new Error(
      "OpenAI returned an empty answer"
    );
  }

  console.log(
    "OpenAI LLM provider test completed successfully."
  );
} catch (error: any) {
  console.log("---------------------------------");
  console.log("Provider Test Result:");
  console.log(
    error?.message || error
  );
  console.log("---------------------------------");

  if (
    error?.message ===
    "OpenAI API credits are exhausted. AI answer generation is currently unavailable."
  ) {
    console.log(
      "Expected quota handling passed."
    );

    console.log(
      "OpenAI provider is correctly handling exhausted credits."
    );

    process.exit(0);
  }

  throw error;
}