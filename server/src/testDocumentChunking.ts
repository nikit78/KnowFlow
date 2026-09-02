import { chunkDocumentText } from "./services/documentChunkingService.js";

const testText = `
KnowFlow is a document management and AI-powered knowledge platform.

Users can upload documents such as research papers, lecture notes,
annual reports, financial statements, books and other supported files.

After uploading a document, KnowFlow extracts the text from the file.
The extracted text can then be divided into smaller chunks.

These chunks will later be used for embeddings, vector search,
semantic search and Retrieval Augmented Generation.

The purpose of chunking is to make large documents easier for
AI systems to process and retrieve relevant information from.
`.repeat(20);

const runTest = () => {
  try {
    console.log("Starting document chunking test...");

    const chunks = chunkDocumentText(testText);

    console.log("=================================");
    console.log("Chunking successful!");
    console.log("=================================");

    console.log("Original text length:", testText.length);
    console.log("Total chunks:", chunks.length);

    console.log("=================================");
    console.log("First chunk:");
    console.log("=================================");
    console.log(chunks[0]);

    console.log("=================================");
    console.log("Second chunk:");
    console.log("=================================");
    console.log(chunks[1]);

    console.log("=================================");
    console.log("Chunk lengths:");
    console.log("=================================");

    chunks.forEach((chunk, index) => {
      console.log(
        `Chunk ${index + 1}: ${chunk.length} characters`
      );
    });
  } catch (error) {
    console.error(
      "Chunking test failed:",
      error
    );
  }
};

runTest();