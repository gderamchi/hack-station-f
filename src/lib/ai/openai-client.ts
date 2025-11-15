import OpenAI from "openai";

// Validate API key
if (!process.env.BLACKBOX_API_KEY) {
  throw new Error("BLACKBOX_API_KEY environment variable is not set");
}

// Initialize Blackbox AI client (OpenAI-compatible API)
export const openai = new OpenAI({
  apiKey: process.env.BLACKBOX_API_KEY,
  baseURL: "https://api.blackbox.ai/v1", // Blackbox AI endpoint
});

// Configuration constants
export const AI_CONFIG = {
  model: "blackboxai/openai/gpt-4o-mini" as const, // Blackbox AI model path
  temperature: 0.7,
  maxTokens: 1000,
  maxRetries: 3,
  retryDelay: 1000, // milliseconds
} as const;

// Retry logic for API calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = AI_CONFIG.maxRetries,
  delay: number = AI_CONFIG.retryDelay
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error instanceof OpenAI.APIError) {
        // Don't retry on authentication or invalid request errors
        if (error.status === 401 || error.status === 400) {
          throw error;
        }
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

// Helper to check if Blackbox AI is configured
export function isOpenAIConfigured(): boolean {
  return !!process.env.BLACKBOX_API_KEY;
}
