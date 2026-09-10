import OpenAI from "openai";

// ==========================
// Embedding Service
// ==========================

export type EmbeddingInputType = "passage" | "query";

export interface GenerateEmbeddingOptions {
  inputType?: EmbeddingInputType;
}

const getNvidiaEmbeddingClient = (): OpenAI => {
  const apiKey = process.env.NVIDIA_API_KEY;

  const baseURL =
    process.env.NVIDIA_EMBEDDING_BASE_URL ||
    "https://integrate.api.nvidia.com/v1";

  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is not defined");
  }

  return new OpenAI({
    apiKey,
    baseURL,
  });
};

const generateNvidiaEmbedding = async (
  text: string,
  inputType: EmbeddingInputType
): Promise<number[]> => {
  const model =
    process.env.NVIDIA_EMBEDDING_MODEL ||
    "nvidia/nemotron-3-embed-1b";

  const client = getNvidiaEmbeddingClient();

  const requestBody = {
    model,
    input: text,
    input_type: inputType,
    encoding_format: "float",
  };

  const response =
    await client.embeddings.create(requestBody as any);

  const rawEmbedding =
  response.data[0]?.embedding;

if (!rawEmbedding) {
  throw new Error(
    "NVIDIA returned an empty embedding"
  );
}

const embedding: number[] =
  Array.isArray(rawEmbedding)
    ? rawEmbedding
    : JSON.parse(rawEmbedding);

if (embedding.length === 0) {
  throw new Error(
    "NVIDIA returned an empty embedding"
  );
}

return embedding;
};

const generateOpenAiEmbedding = async (
  text: string
): Promise<number[]> => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not defined"
    );
  }

  const openai = new OpenAI({
    apiKey,
  });

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
};

export const generateEmbedding = async (
  text: string,
  options: GenerateEmbeddingOptions = {}
): Promise<number[]> => {
  if (!text || !text.trim()) {
    throw new Error(
      "Text is required to generate embedding"
    );
  }

  const inputType =
    options.inputType || "passage";

  const provider =
    (
      process.env.EMBEDDING_PROVIDER ||
      "nvidia"
    )
      .trim()
      .toLowerCase();

  try {
    if (provider === "nvidia") {
      return await generateNvidiaEmbedding(
        text.trim(),
        inputType
      );
    }

    if (provider === "openai") {
      return await generateOpenAiEmbedding(
        text.trim()
      );
    }

    throw new Error(
      `Unsupported EMBEDDING_PROVIDER: ${provider}`
    );
  } catch (error: any) {
    if (
      error?.code === "insufficient_quota" ||
      error?.code === "credit_balance_exhausted"
    ) {
      throw new Error(
        "OpenAI API credits are exhausted. Embedding generation is currently unavailable."
      );
    }

    console.error(
      `${provider.toUpperCase()} embedding generation failed:`,
      error
    );

    throw error;
  }
};