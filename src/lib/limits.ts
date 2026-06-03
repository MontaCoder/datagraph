import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : undefined;

const isLocal = false; // process.env.NODE_ENV !== "production";

// 50 messages per day
const ratelimit =
  !isLocal && redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.fixedWindow(50, "1 d"),
        analytics: true,
      })
    : undefined;

// Code execution is the most expensive path (spins up an E2B sandbox) and is
// hit multiple times per question (including auto-retries), so it gets its own,
// more generous bucket on a separate key namespace.
const codeRunRatelimit =
  !isLocal && redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.fixedWindow(150, "1 d"),
        analytics: true,
        prefix: "ratelimit:coderuns",
      })
    : undefined;

export const getRemainingMessages = async (userFingerPrint: string) => {
  if (!ratelimit) return { remaining: 50 };
  const result = await ratelimit.getRemaining(userFingerPrint);
  return {
    remaining: result.remaining,
    reset: result.reset,
  };
};

export const limitMessages = async (userFingerPrint: string) => {
  if (!ratelimit) return;
  const result = await ratelimit.limit(userFingerPrint);

  if (!result.success) {
    throw new Error("Too many messages");
  }

  return result;
};

export const limitCodeRuns = async (userFingerPrint: string) => {
  if (!codeRunRatelimit) return;
  const result = await codeRunRatelimit.limit(userFingerPrint);

  if (!result.success) {
    throw new Error("Too many code executions");
  }

  return result;
};
