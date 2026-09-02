import OpenAI from "openai";

// ==========================
// Generate Embedding
// ==========================

export const generateEmbedding = async (
  text: string
): Promise<number[]> => {
  // ==========================
  // Validate Text
  // ==========================

  if (!text || !text.trim()) {
    throw new Error(
      "Text is required to generate embedding"
    );
  }

  // ==========================
  // Check API Key
  // ==========================

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not defined"
    );
  }

  // ==========================
  // Create OpenAI Client
  // ==========================

  const openai = new OpenAI({
    apiKey,
  });

  try {
    // ==========================
    // Generate Embedding
    // ==========================

    const response =
      await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

    const embedding =
      response.data[0]?.embedding;

    if (!embedding || embedding.length === 0) {
      throw new Error(
        "OpenAI returned an empty embedding"
      );
    }

    return embedding;
  } catch (error: any) {
    // ==========================
    // Handle Billing / Quota
    // ==========================

    if (
      error?.code ===
      "credit_balance_exhausted"
    ) {
      throw new Error(
        "OpenAI API credits are exhausted. Embedding generation is currently unavailable."
      );
    }

    // ==========================
    // Handle Other Errors
    // ==========================

    console.error(
      "Embedding generation failed:",
      error
    );

    throw error;
  }
};