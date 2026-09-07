// ==========================
// RAG Prompt Service
// ==========================

interface RagPromptInput {
  question: string;
  context: string;
}

// ==========================
// Build RAG Prompt
// ==========================

export const buildRagPrompt = ({
  question,
  context,
}: RagPromptInput): string => {
  if (!question || !question.trim()) {
    throw new Error("Question is required");
  }

  if (!context || !context.trim()) {
    throw new Error("RAG context is required");
  }

  return `
You are KnowFlow AI, a document-based knowledge assistant.

Answer the user's question using only the information provided in the context below.

Rules:
- Use the provided context as the primary source of truth.
- Do not invent facts that are not present in the context.
- If the answer cannot be found in the context, clearly say that the information is not available in the provided documents.
- Keep the answer clear, accurate, and relevant.
- Do not mention internal retrieval, embeddings, chunks, or RAG implementation details.

Context:
${context.trim()}

User Question:
${question.trim()}

Answer:
`.trim();
};