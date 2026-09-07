import OpenAI from "openai";

// ==========================
// OpenAI LLM Service
// ==========================

export interface OpenAiLlmInput {
  prompt: string;
}

export const generateOpenAiAnswer = async ({
  prompt,
}: OpenAiLlmInput): Promise<string> => {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required");
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not defined"
    );
  }

  const openai = new OpenAI({
    apiKey,
  });

  try {
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
      });

    const answer =
      response.choices[0]?.message?.content?.trim();

    if (!answer) {
      throw new Error(
        "OpenAI returned an empty answer"
      );
    }

    return answer;
  } catch (error: any) {
    if (
      error?.code ===
      "insufficient_quota"
    ) {
      throw new Error(
        "OpenAI API credits are exhausted. AI answer generation is currently unavailable."
      );
    }

    if (
      error?.code ===
      "credit_balance_exhausted"
    ) {
      throw new Error(
        "OpenAI API credits are exhausted. AI answer generation is currently unavailable."
      );
    }

    console.error(
      "OpenAI answer generation failed:",
      error
    );

    throw error;
  }
};