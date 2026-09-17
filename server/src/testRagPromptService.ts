import { buildRagPrompt } from "./services/ragPromptService.js";

// ==========================
// Test RAG Prompt Builder
// ==========================

const question =
  "What technologies does Nikit have experience with?";

const context = `
[Context 1]
Document: Chunk Integration Test
Chunk: 0
Content:
Nikit Gupta is a Computer Science undergraduate.

[Context 2]
Document: Chunk Integration Test
Chunk: 1
Content:
He has experience with React.js, Node.js, Express.js, and MongoDB.
`;

console.log("=================================");
console.log("RAG Prompt Builder Test");
console.log("=================================");

const prompt = buildRagPrompt({
  question,
  context,
});

console.log(prompt);

console.log("=================================");
console.log("Prompt Length:", prompt.length);
console.log("=================================");

// ==========================
// Basic Validation
// ==========================

if (!prompt.includes("KnowFlow AI")) {
  throw new Error("System instruction is missing");
}

if (!prompt.includes(question)) {
  throw new Error("User question is missing");
}

if (!prompt.includes("React.js")) {
  throw new Error("Context is missing");
}

if (!prompt.includes("Node.js")) {
  throw new Error("Context content is missing");
}

if (!prompt.includes("Do not invent facts")) {
  throw new Error("Anti-hallucination instruction is missing");
}

console.log(
  "RAG Prompt Builder test completed successfully."
);

// ==========================
// Validation: Empty Question
// ==========================

try {
  buildRagPrompt({
    question: "",
    context,
  });

  throw new Error(
    "Empty question should have been rejected"
  );
} catch (error: any) {
  if (
    error?.message !==
    "Question is required"
  ) {
    throw error;
  }

  console.log(
    "Empty question validation passed"
  );
}

// ==========================
// Validation: Empty Context
// ==========================

try {
  buildRagPrompt({
    question,
    context: "",
  });

  throw new Error(
    "Empty context should have been rejected"
  );
} catch (error: any) {
  if (
    error?.message !==
    "RAG context is required"
  ) {
    throw error;
  }

  console.log(
    "Empty context validation passed"
  );
}

console.log("=================================");
console.log(
  "All RAG Prompt Builder tests passed."
);
console.log("=================================");