import mongoose from "mongoose";

import DocumentChunk from "../models/DocumentChunk.js";

import { generateEmbedding } from "./embeddingService.js";

// ==========================
// Cosine Similarity
// ==========================

const cosineSimilarity = (
  vectorA: number[],
  vectorB: number[]
): number => {
  if (
    vectorA.length === 0 ||
    vectorB.length === 0 ||
    vectorA.length !== vectorB.length
  ) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  );
};

// ==========================
// Normalize Score
// ==========================

const normalizeScore = (
  score: number,
  min: number,
  max: number
): number => {
  if (max === min) {
    return score > 0 ? 1 : 0;
  }

  return (score - min) / (max - min);
};

// ==========================
// Search Document Chunks
// ==========================

export const searchDocumentChunks = async (
  userId: mongoose.Types.ObjectId,
  searchText: string,
  limit = 5
) => {
  // ==========================
  // Validate Search Text
  // ==========================

  if (!searchText || !searchText.trim()) {
    return [];
  }

  // ==========================
  // Safe Limit
  // ==========================

  const safeLimit = Math.min(
    Math.max(limit, 1),
    20
  );

  const query = searchText.trim();

  // ==========================
  // Keyword Search
  // ==========================

  let keywordChunks: any[] = [];

  try {
    keywordChunks = await DocumentChunk.find({
      user: userId,
      $text: {
        $search: query,
      },
    })
      .select("document chunkIndex text")
      .select({
        score: {
          $meta: "textScore",
        },
      })
      .populate({
        path: "document",
        select:
          "title originalName documentType status isDeleted",
        match: {
          user: userId,
          isDeleted: false,
        },
      })
      .sort({
        score: {
          $meta: "textScore",
        },
      })
      .limit(safeLimit * 3)
      .lean();
  } catch (error) {
    console.warn(
      "Keyword chunk search failed:",
      error
    );

    keywordChunks = [];
  }

  // ==========================
  // Remove Deleted / Missing
  // Documents
  // ==========================

  keywordChunks = keywordChunks.filter(
    (chunk) => chunk.document
  );

  // ==========================
  // Check Semantic Candidates
  // ==========================

  let embeddedChunks: any[] = [];

  try {
    embeddedChunks = await DocumentChunk.find({
      user: userId,
      embedding: {
        $exists: true,
        $not: {
          $size: 0,
        },
      },
    })
      .select(
        "document chunkIndex text embedding"
      )
      .populate({
        path: "document",
        select:
          "title originalName documentType status isDeleted",
        match: {
          user: userId,
          isDeleted: false,
        },
      })
      .lean();
  } catch (error) {
    console.warn(
      "Semantic chunk candidate search failed:",
      error
    );

    embeddedChunks = [];
  }

  embeddedChunks = embeddedChunks.filter(
    (chunk) =>
      chunk.document &&
      Array.isArray(chunk.embedding) &&
      chunk.embedding.length > 0
  );

  // ==========================
  // If No Embeddings Exist
  // ==========================

  if (embeddedChunks.length === 0) {
    return keywordChunks
      .slice(0, safeLimit)
      .map((chunk) => ({
        ...chunk,
        score: chunk.score ?? 0,
        semanticScore: 0,
        keywordScore: chunk.score ?? 0,
        hybridScore: chunk.score ?? 0,
      }));
  }

  // ==========================
  // Generate Query Embedding
  // ==========================

  let queryEmbedding: number[] | null = null;

  try {
   queryEmbedding = await generateEmbedding(
  query,
  {
    inputType: "query",
  }
);
  } catch (error: any) {
    console.warn(
      "Query embedding generation failed. Falling back to keyword search:",
      error?.message || error
    );

    queryEmbedding = null;
  }

  // ==========================
  // If Query Embedding Failed
  // ==========================

  if (
    !queryEmbedding ||
    queryEmbedding.length === 0
  ) {
    return keywordChunks
      .slice(0, safeLimit)
      .map((chunk) => ({
        ...chunk,
        score: chunk.score ?? 0,
        semanticScore: 0,
        keywordScore: chunk.score ?? 0,
        hybridScore: chunk.score ?? 0,
      }));
  }

  // ==========================
  // Calculate Semantic Scores
  // ==========================

  const semanticResults = embeddedChunks.map(
    (chunk) => {
      const semanticScore =
        cosineSimilarity(
          queryEmbedding!,
          chunk.embedding
        );

      return {
        ...chunk,
        semanticScore,
      };
    }
  );

  // ==========================
  // Sort Semantic Results
  // ==========================

  semanticResults.sort(
    (a, b) =>
      b.semanticScore -
      a.semanticScore
  );

  const topSemanticResults =
    semanticResults.slice(
      0,
      Math.max(safeLimit * 3, 15)
    );

  // ==========================
  // Keyword Score Map
  // ==========================

  const keywordScoreMap = new Map<
    string,
    number
  >();

  for (const chunk of keywordChunks) {
    keywordScoreMap.set(
      `${chunk.document._id}-${chunk.chunkIndex}`,
      Number(chunk.score ?? 0)
    );
  }

  // ==========================
  // Collect Hybrid Candidates
  // ==========================

  const candidateMap = new Map<
    string,
    any
  >();

  for (const chunk of topSemanticResults) {
    const key = `${chunk.document._id}-${chunk.chunkIndex}`;

    candidateMap.set(key, {
      ...chunk,
      keywordScore:
        keywordScoreMap.get(key) ?? 0,
    });
  }

  for (const chunk of keywordChunks) {
    const key = `${chunk.document._id}-${chunk.chunkIndex}`;

    if (!candidateMap.has(key)) {
      const semanticMatch =
        semanticResults.find(
          (item) =>
            `${item.document._id}-${item.chunkIndex}` ===
            key
        );

      candidateMap.set(key, {
        ...chunk,
        embedding: undefined,
        semanticScore:
          semanticMatch?.semanticScore ?? 0,
        keywordScore:
          Number(chunk.score ?? 0),
      });
    }
  }

  const candidates =
    Array.from(candidateMap.values());

  // ==========================
  // Normalize Keyword Scores
  // ==========================

  const keywordScores = candidates.map(
    (chunk) =>
      Number(chunk.keywordScore ?? 0)
  );

  const minKeywordScore =
    keywordScores.length > 0
      ? Math.min(...keywordScores)
      : 0;

  const maxKeywordScore =
    keywordScores.length > 0
      ? Math.max(...keywordScores)
      : 0;

  // ==========================
  // Calculate Hybrid Score
  // ==========================

  const rankedResults = candidates.map(
    (chunk) => {
      const normalizedKeywordScore =
        normalizeScore(
          Number(chunk.keywordScore ?? 0),
          minKeywordScore,
          maxKeywordScore
        );

      const normalizedSemanticScore =
        Math.max(
          0,
          Math.min(
            1,
            (Number(chunk.semanticScore ?? 0) +
              1) /
              2
          )
        );

      // Semantic meaning gets higher weight.
      const hybridScore =
        normalizedSemanticScore * 0.7 +
        normalizedKeywordScore * 0.3;

      return {
        ...chunk,
        score: hybridScore,
        semanticScore:
          Number(chunk.semanticScore ?? 0),
        keywordScore:
          Number(chunk.keywordScore ?? 0),
        hybridScore,
      };
    }
  );

  // ==========================
  // Final Ranking
  // ==========================

  rankedResults.sort(
    (a, b) =>
      b.hybridScore -
      a.hybridScore
  );

  // ==========================
  // Remove Embeddings
  // From API Result
  // ==========================

  return rankedResults
    .slice(0, safeLimit)
    .map((chunk) => {
      const {
        embedding,
        ...result
      } = chunk;

      return result;
    });
};