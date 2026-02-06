import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { User } from "@/shared/types/user";
import { loadAuthenticatedUser } from "./authUtils";
import { logger } from "@/backend/infrastructure/utils/logger";

// ============================================
// Types
// ============================================

export interface ApiContext<TParams = Record<string, string>> {
  user: User | null;
  params: TParams;
}

export interface AuthenticatedApiContext<TParams = Record<string, string>> {
  user: User;
  params: TParams;
}

export type ApiHandler<TParams = Record<string, string>> = (
  request: NextRequest,
  context: ApiContext<TParams>
) => Promise<NextResponse>;

export type AuthenticatedApiHandler<TParams = Record<string, string>> = (
  request: NextRequest,
  context: AuthenticatedApiContext<TParams>
) => Promise<NextResponse>;

export interface RouteContext<TParams = Record<string, string>> {
  params: Promise<TParams>;
}

// ============================================
// Rate Limiting with Upstash
// ============================================

// Create Redis client (uses env vars automatically)
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Fallback in-memory store for development without Upstash
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit presets
export const RateLimitPreset = {
  /** 5 requests per minute - for auth endpoints */
  AUTH: { requests: 5, window: "1m" as const },
  /** 20 requests per minute - for payment endpoints */
  PAYMENT: { requests: 20, window: "1m" as const },
  /** 60 requests per minute - for general API */
  GENERAL: { requests: 60, window: "1m" as const },
  /** 3 requests per hour - for password reset */
  PASSWORD_RESET: { requests: 3, window: "1h" as const },
  /** 10 requests per 15 minutes - for MFA */
  MFA: { requests: 10, window: "15m" as const },
  /** 3 requests per 15 minutes - for sensitive operations (password change) */
  SENSITIVE: { requests: 3, window: "15m" as const },
  /** 5 requests per 15 minutes - for MFA verification */
  MFA_VERIFY: { requests: 5, window: "15m" as const },
} as const;

type RateLimitConfig = (typeof RateLimitPreset)[keyof typeof RateLimitPreset];

// Create rate limiters for each preset
const rateLimiters = new Map<string, Ratelimit>();

function getRateLimiter(config: RateLimitConfig): Ratelimit | null {
  if (!redis) return null;

  const key = `${config.requests}-${config.window}`;
  if (!rateLimiters.has(key)) {
    rateLimiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.requests, config.window),
        analytics: true,
        prefix: "guidassur:ratelimit",
      })
    );
  }
  return rateLimiters.get(key)!;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{ allowed: boolean; resetTime: number }> {
  const ip = getClientIp(request);
  const key = `${ip}:${request.nextUrl.pathname}`;

  // Use Upstash if available
  const limiter = getRateLimiter(config);
  if (limiter) {
    const result = await limiter.limit(key);
    return {
      allowed: result.success,
      resetTime: result.reset,
    };
  }

  // Fallback to in-memory for development
  const windowMs =
    config.window === "1m"
      ? 60000
      : config.window === "15m"
        ? 900000
        : 3600000;
  const now = Date.now();
  const record = inMemoryStore.get(key);

  if (!record || record.resetTime < now) {
    inMemoryStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, resetTime: now + windowMs };
  }

  if (record.count >= config.requests) {
    return { allowed: false, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, resetTime: record.resetTime };
}

// ============================================
// CSRF Protection
// ============================================

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000",
  "https://localhost:3000",
  "https://guidassur.vercel.app",
].filter(Boolean) as string[];

function validateCsrf(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin) {
    return ALLOWED_ORIGINS.some((allowed) => origin === allowed);
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return ALLOWED_ORIGINS.some((allowed) => {
        const allowedUrl = new URL(allowed);
        return refererUrl.origin === allowedUrl.origin;
      });
    } catch {
      return false;
    }
  }

  return false;
}

// ============================================
// Auth helpers
// ============================================

// Use shared utility for loading authenticated user
const getAuthUser = loadAuthenticatedUser;

// ============================================
// Handler options
// ============================================

export interface HandlerOptions {
  /** Require authentication */
  auth?: boolean;
  /** Require verified email */
  emailVerified?: boolean;
  /** Rate limit preset */
  rateLimit?: RateLimitConfig;
  /** Enable CSRF protection (recommended for mutations) */
  csrf?: boolean;
}

// ============================================
// Error responses
// ============================================

function rateLimitResponse(resetTime: number): NextResponse {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Trop de requêtes. Veuillez réessayer plus tard." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, retryAfter)),
      },
    }
  );
}

function csrfResponse(): NextResponse {
  return NextResponse.json({ error: "Requête non autorisée (CSRF)" }, { status: 403 });
}

function authResponse(): NextResponse {
  return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
}

function emailNotVerifiedResponse(): NextResponse {
  return NextResponse.json(
    { error: "Veuillez confirmer votre adresse email" },
    { status: 403 }
  );
}

// ============================================
// Main handler wrapper
// ============================================

/**
 * Creates a protected API handler with rate limiting, CSRF protection, and authentication.
 */
export function createHandler<TParams = Record<string, string>>(
  handler: ApiHandler<TParams>,
  options: HandlerOptions = {}
) {
  return async (
    request: NextRequest,
    routeContext?: RouteContext<TParams>
  ): Promise<NextResponse> => {
    const params = routeContext?.params
      ? await routeContext.params
      : ({} as TParams);

    // 1. Rate limiting
    if (options.rateLimit) {
      const result = await checkRateLimit(request, options.rateLimit);
      if (!result.allowed) {
        return rateLimitResponse(result.resetTime);
      }
    }

    // 2. CSRF protection (for mutations)
    if (options.csrf) {
      if (!validateCsrf(request)) {
        return csrfResponse();
      }
    }

    // 3. Authentication
    const user = await getAuthUser();

    if (options.auth && !user) {
      return authResponse();
    }

    // 4. Email verification
    if (options.emailVerified && (!user || !user.emailVerified)) {
      return emailNotVerifiedResponse();
    }

    // 5. Execute handler
    return handler(request, { user, params });
  };
}

/**
 * Creates a protected API handler that requires authentication.
 * The user is guaranteed to be non-null in the handler.
 */
export function createAuthHandler<TParams = Record<string, string>>(
  handler: AuthenticatedApiHandler<TParams>,
  options: Omit<HandlerOptions, "auth"> = {}
) {
  return createHandler<TParams>(
    (request, context) => {
      // TypeScript knows user is non-null here because auth: true
      return handler(request, context as AuthenticatedApiContext<TParams>);
    },
    { ...options, auth: true }
  );
}

// Re-export presets for convenience
export { RateLimitPreset as RateLimit };
