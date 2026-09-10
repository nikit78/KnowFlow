import OpenAI from "openai";

// ==========================
// LLM Service
// ==========================

export interface OpenAiLlmInput {
  prompt: string;
}

const getNvidiaClient = (): OpenAI => {
  const apiKey = process.env.NVIDIA_API_KEY;
  const baseURL =
    process.env.NVIDIA_BASE_URL ||
    "https://integrate.api.nvidia.com/v1";

  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is not defined");
  }

  return new OpenAI({
    apiKey,
    baseURL,
  });
};

const generateNvidiaAnswer = async (
  prompt: string
): Promise<string> => {
  const model =
    process.env.NVIDIA_LLM_MODEL ||
    "nvidia/nemotron-3.5-lightning-30b-a3b";

  const nvidia = getNvidiaClient();

const requestBody = {
  model,
  messages: [
    {
      role: "user" as const,
      content: prompt,
    },
  ],
  temperature: 0.2,
  max_tokens: 1200,

  chat_template_kwargs: {
    enable_thinking: false,
  },
};

const response =
  await nvidia.chat.completions.create(
    requestBody as any
  );
  const answer =
    response.choices[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error(
      "NVIDIA returned an empty answer"
    );
  }

  return answer;
};

const generateOpenAiFallbackAnswer = async (
  prompt: string
): Promise<string> => {
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
    await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1200,
    });

  const answer =
    response.choices[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error(
      "OpenAI returned an empty answer"
    );
  }

  return answer;
};

export const generateOpenAiAnswer = async ({
  prompt,
}: OpenAiLlmInput): Promise<string> => {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required");
  }

  const provider =
    (process.env.LLM_PROVIDER || "nvidia")
      .trim()
      .toLowerCase();

  try {
    if (provider === "nvidia") {
      return await generateNvidiaAnswer(
        prompt.trim()
      );
    }

    if (provider === "openai") {
      return await generateOpenAiFallbackAnswer(
        prompt.trim()
      );
    }

    throw new Error(
      `Unsupported LLM_PROVIDER: ${provider}`
    );
  } catch (error: any) {
    if (
      error?.code === "insufficient_quota" ||
      error?.code === "credit_balance_exhausted"
    ) {
      throw new Error(
        "OpenAI API credits are exhausted. AI answer generation is currently unavailable."
      );
    }

    console.error(
      `${provider.toUpperCase()} answer generation failed:`,
      error
    );

    throw error;
  }
};