import {
  generateLlmAnswer,
} from "./services/llmService.js";

// ==========================
// Test LLM Service
// ==========================

console.log("=================================");
console.log("LLM Service Test");
console.log("=================================");

// ==========================
// Test: Valid Prompt
// ==========================

try {
  await generateLlmAnswer({
    prompt:
      "What technologies does the document mention?",
  });

  throw new Error(
    "LLM service should not return an answer before provider configuration"
  );
} catch (error: any) {
  if (
    error?.message !==
    "LLM provider is not configured yet"
  ) {
    throw error;
  }

  console.log(
    "Provider configuration validation passed"
  );
}

// ==========================
// Test: Empty Prompt
// ==========================

try {
  await generateLlmAnswer({
    prompt: "",
  });

  throw new Error(
    "Empty prompt should have been rejected"
  );
} catch (error: any) {
  if (
    error?.message !==
    "Prompt is required"
  ) {
    throw error;
  }

  console.log(
    "Empty prompt validation passed"
  );
}

console.log("=================================");
console.log(
  "All LLM Service tests passed."
);
console.log("=================================");