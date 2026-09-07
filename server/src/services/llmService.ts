// ==========================
// LLM Service
// ==========================

export interface LlmGenerateInput {
  prompt: string;
}

export interface LlmGenerateResult {
  answer: string;
}

// ==========================
// Generate LLM Answer
// ==========================

export const generateLlmAnswer = async ({
  prompt,
}: LlmGenerateInput): Promise<LlmGenerateResult> => {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required");
  }

  // ==========================
  // LLM Provider Integration
  // ==========================
  //
  // Actual provider call will be
  // added after the service boundary
  // is tested.
  //

  throw new Error(
    "LLM provider is not configured yet"
  );
};