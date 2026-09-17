import { buildRagContext } from "./services/ragContextService.js";

// ==========================
// Test RAG Context Builder
// ==========================

const testChunks = [
  {
    document: {
      title: "Chunk Integration Test",
      originalName: "resume dev 1.pdf",
    },
    chunkIndex: 0,
    text: "Nikit Gupta is a Computer Science undergraduate.",
    score: 2.5,
  },
  {
    document: {
      title: "Chunk Integration Test",
      originalName: "resume dev 1.pdf",
    },
    chunkIndex: 1,
    text: "He has experience with React.js, Node.js, Express.js, and MongoDB.",
    score: 2.1,
  },
  {
    document: {
      title: "Chunk Integration Test",
      originalName: "resume dev 1.pdf",
    },
    chunkIndex: 2,
    text: "His project GitPulse is a GitHub Profile Analyzer.",
    score: 1.8,
  },
];

console.log("=================================");
console.log("RAG Context Builder Test");
console.log("=================================");

const context = buildRagContext(testChunks);

console.log(context);

console.log("=================================");
console.log("Context Length:", context.length);
console.log("=================================");

// ==========================
// Basic Validation
// ==========================

if (!context.includes("[Context 1]")) {
  throw new Error("Context 1 is missing");
}

if (!context.includes("Chunk Integration Test")) {
  throw new Error("Document title is missing");
}

if (!context.includes("React.js")) {
  throw new Error("Chunk content is missing");
}

if (!context.includes("[Context 3]")) {
  throw new Error("Context 3 is missing");
}

console.log(
  "RAG Context Builder test completed successfully."
);