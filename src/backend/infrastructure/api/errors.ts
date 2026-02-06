import { NextResponse } from "next/server";
import { logger } from "@/backend/infrastructure/utils/logger";

// Custom application errors
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Non authentifié") {
    super(message, 401, "AUTH_ERROR");
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Accès non autorisé") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Ressource introuvable") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Données invalides") {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

// Known error patterns to extract meaningful messages
const ERROR_PATTERNS: Array<{
  pattern: RegExp | string;
  message: string;
  statusCode: number;
}> = [
  // Auth errors
  { pattern: /invalid.*token/i, message: "Session expirée, veuillez vous reconnecter", statusCode: 401 },
  { pattern: /jwt expired/i, message: "Session expirée, veuillez vous reconnecter", statusCode: 401 },
  { pattern: /not authenticated/i, message: "Veuillez vous connecter", statusCode: 401 },
  { pattern: /unauthorized/i, message: "Accès non autorisé", statusCode: 403 },

  // Validation errors
  { pattern: /required/i, message: "Champs requis manquants", statusCode: 400 },
  { pattern: /invalid.*email/i, message: "Adresse email invalide", statusCode: 400 },
  { pattern: /invalid.*password/i, message: "Mot de passe invalide", statusCode: 400 },

  // Database errors
  { pattern: /unique.*constraint/i, message: "Cette ressource existe déjà", statusCode: 409 },
  { pattern: /foreign.*key/i, message: "Référence invalide", statusCode: 400 },
  { pattern: /not found/i, message: "Ressource introuvable", statusCode: 404 },

  // Rate limiting
  { pattern: /rate.*limit/i, message: "Trop de requêtes, veuillez réessayer plus tard", statusCode: 429 },

  // Stripe errors
  { pattern: /card.*declined/i, message: "Carte refusée", statusCode: 400 },
  { pattern: /insufficient.*funds/i, message: "Fonds insuffisants", statusCode: 400 },
];

// Extract a user-friendly message from an error
function extractErrorMessage(error: unknown): { message: string; statusCode: number } {
  // Handle our custom errors
  if (error instanceof AppError) {
    return { message: error.message, statusCode: error.statusCode };
  }

  // Handle standard errors
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // Check against known patterns
    for (const { pattern, message, statusCode } of ERROR_PATTERNS) {
      const matches = typeof pattern === "string"
        ? errorMessage.includes(pattern.toLowerCase())
        : pattern.test(errorMessage);

      if (matches) {
        return { message, statusCode };
      }
    }

    // Unknown error — never expose raw message to client
  }

  // Default fallback
  return { message: "Une erreur inattendue s'est produite", statusCode: 500 };
}

// Handle API errors and return appropriate response
export function handleApiError(
  error: unknown,
  context?: string
): NextResponse<{ error: string; code?: string }> {
  const { message, statusCode } = extractErrorMessage(error);

  // Log the full error for debugging
  logger.error(context || "API Error", error, { statusCode, userMessage: message });

  const response: { error: string; code?: string } = { error: message };

  if (error instanceof AppError && error.code) {
    response.code = error.code;
  }

  return NextResponse.json(response, { status: statusCode });
}

// Shorthand for common error responses
export const apiError = {
  unauthorized: (message?: string) =>
    NextResponse.json({ error: message || "Non authentifié" }, { status: 401 }),

  forbidden: (message?: string) =>
    NextResponse.json({ error: message || "Accès non autorisé" }, { status: 403 }),

  notFound: (message?: string) =>
    NextResponse.json({ error: message || "Ressource introuvable" }, { status: 404 }),

  badRequest: (message?: string) =>
    NextResponse.json({ error: message || "Requête invalide" }, { status: 400 }),

  conflict: (message?: string) =>
    NextResponse.json({ error: message || "Conflit de ressource" }, { status: 409 }),

  internal: (message?: string) =>
    NextResponse.json({ error: message || "Erreur interne du serveur" }, { status: 500 }),
};
