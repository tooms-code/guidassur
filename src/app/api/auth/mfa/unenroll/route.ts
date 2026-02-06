import { NextResponse } from "next/server";
import { createAuthHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { authService } from "@/backend/application/services/AuthService";
import { AuthError } from "@/backend/domain/interfaces/IAuthProvider";
import { Disable2FARequestDto } from "@/backend/application/dtos/user.dto";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

export const POST = createAuthHandler(
  async (request) => {
    try {
      const body: Disable2FARequestDto = await request.json();

      if (!body.code) {
        const error: ErrorResponseDto = { error: "Code requis" };
        return NextResponse.json(error, { status: 400 });
      }

      const mfaStatus = await authService.getMFAStatus();
      if (!mfaStatus.factorId || !mfaStatus.enabled) {
        const error: ErrorResponseDto = { error: "L'A2F n'est pas activée" };
        return NextResponse.json(error, { status: 400 });
      }

      await authService.unenrollMFA(mfaStatus.factorId, body.code);

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      if (error instanceof AuthError) {
        const errorDto: ErrorResponseDto = { error: error.message, code: error.code };
        return NextResponse.json(errorDto, { status: 400 });
      }
      logger.error("Error unenrolling MFA", error);
      const errorDto: ErrorResponseDto = { error: "Erreur lors de la désactivation de l'A2F" };
      return NextResponse.json(errorDto, { status: 500 });
    }
  },
  { rateLimit: RateLimit.MFA, csrf: true }
);
