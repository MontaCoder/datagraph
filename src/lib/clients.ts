import { createCerebras } from "@ai-sdk/cerebras";
import { Redis } from "@upstash/redis";

let cerebrasProvider: ReturnType<typeof createCerebras> | undefined;

function getCerebrasProvider(): ReturnType<typeof createCerebras> {
  if (!cerebrasProvider) {
    cerebrasProvider = createCerebras({
      apiKey: process.env.CEREBRAS_API_KEY,
    });
  }
  return cerebrasProvider;
}

export function cerebrasClient(modelId: string) {
  return getCerebrasProvider()(modelId);
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
