// ==========================
// RAG Context Service
// ==========================

interface SearchChunk {
  document: unknown;
  chunkIndex: number;
  text: string;
  score?: number;
}

// ==========================
// Build RAG Context
// ==========================

export const buildRagContext = (
  chunks: SearchChunk[]
): string => {
  if (!chunks || chunks.length === 0) {
    return "";
  }

  const context = chunks
    .filter(
      (chunk) =>
        chunk.text &&
        chunk.text.trim().length > 0
    )
    .map((chunk, index) => {
      const documentData =
        typeof chunk.document === "object" &&
        chunk.document !== null
          ? chunk.document as {
              title?: string;
              originalName?: string;
            }
          : {};

      const documentTitle =
        documentData.title ||
        documentData.originalName ||
        "Unknown Document";

      return [
        `[Context ${index + 1}]`,
        `Document: ${documentTitle}`,
        `Chunk: ${chunk.chunkIndex}`,
        `Content:`,
        chunk.text.trim(),
      ].join("\n");
    })
    .join("\n\n");

  return context;
};