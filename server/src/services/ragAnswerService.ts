import mongoose from "mongoose";

import { retrieveRagContext } from "./ragRetrievalService.js";
import { buildRagPrompt } from "./ragPromptService.js";
import { generateOpenAiAnswer } from "./openaiLlmService.js";

// ==========================
// RAG Answer Service
// ==========================

export interface RagAnswerInput {
  userId: mongoose.Types.ObjectId;
  question: string;
}

export interface RagAnswerResult {
  answer: string;
  context: string;
  chunks: unknown[];
  sources: {
    documentId: string;
    documentTitle: string;
    originalName: string;
    chunkIndex: number;
  }[];
}

// ==========================
// Generate RAG Answer
// ==========================

export const generateRagAnswer = async ({
  userId,
  question,
}: RagAnswerInput): Promise<RagAnswerResult> => {
  if (!question || !question.trim()) {
    throw new Error("Question is required");
  }

  // ==========================
  // Retrieve Relevant Context
  // ==========================

  const retrievalResult =
    await retrieveRagContext(
      userId,
      question.trim()
    );

  if (
    retrievalResult.chunks.length === 0 ||
    !retrievalResult.context
  ) {
    throw new Error(
      "No relevant document context found"
    );
  }

  // ==========================
  // Build LLM Prompt
  // ==========================

  const prompt = buildRagPrompt({
    question: question.trim(),
    context: retrievalResult.context,
  });

  // ==========================
  // Generate AI Answer
  // ==========================

  const answer =
    await generateOpenAiAnswer({
      prompt,
    });

  // ==========================
  // Return RAG Result
  // ==========================

 const sources = retrievalResult.chunks.map(
  (chunk: any) => {
    const document =
      typeof chunk.document === "object" &&
      chunk.document !== null
        ? chunk.document
        : {};

    return {
      documentId:
        document._id?.toString() || "",
      documentTitle:
        document.title ||
        "Unknown Document",
      originalName:
        document.originalName ||
        "",
      chunkIndex:
        chunk.chunkIndex,
    };
  }
);

return {
  answer,
  context: retrievalResult.context,
  chunks: retrievalResult.chunks,
  sources,
};
};