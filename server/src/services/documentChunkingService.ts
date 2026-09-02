// ==========================
// Document Chunking Service
// ==========================

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

// ==========================
// Split Text Into Chunks
// ==========================
export const chunkDocumentText = (
  text: string
): string[] => {
  // Empty text check
  if (!text || !text.trim()) {
    return [];
  }

  const cleanText = text.trim();

  const chunks: string[] = [];

  let start = 0;

  while (start < cleanText.length) {
    const end = Math.min(
      start + CHUNK_SIZE,
      cleanText.length
    );

    const chunk = cleanText
      .slice(start, end)
      .trim();

    if (chunk) {
      chunks.push(chunk);
    }

    // Stop when we reach the end
    if (end >= cleanText.length) {
      break;
    }

    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks;
};