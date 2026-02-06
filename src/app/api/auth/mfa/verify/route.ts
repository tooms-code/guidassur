import { NextResponse } from "next/server";
import { createAuthHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { authService } from "@/backend/application/services/AuthService";
import { AuthError } from "@/backend/domain/interfaces/IAuthProvider";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

export const POST = createAuthHandler(
  async (request) => {
    try {
      const body = await request.json();
      const { code, factorId } = body;

      if (!code) {
        const error: ErrorResponseDto = { error: "Code requis" };
        return NextResponse.json(error, { status: 400 });
      }

      // factorId is required - no auto-discovery fallback
      if (!factorId) {
        const error: ErrorResponseDto = { error: "factorId requis" };
        return NextResponse.json(error, { status: 400 });
      }

      await authService.verifyMFA(factorId, code);

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      if (error instanceof AuthError) {
        const errorDto: ErrorResponseDto = { error: error.message, code: error.code };
        return NextResponse.json(errorDto, { status: 400 });
      }
      logger.error("Error verifying MFA", error);
      const errorDto: ErrorResponseDto = { error: "Erreur lors de la vérification du code" };
      return NextResponse.json(errorDto, { status: 500 });
    }
  },
  { rateLimit: RateLimit.MFA_VERIFY, csrf: true }
);
