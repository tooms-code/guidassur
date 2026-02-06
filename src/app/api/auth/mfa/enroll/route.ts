import { NextResponse } from "next/server";
import { createAuthHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { authService } from "@/backend/application/services/AuthService";
import { AuthError } from "@/backend/domain/interfaces/IAuthProvider";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

export const POST = createAuthHandler(
  async () => {
    try {
      const result = await authService.enrollMFA();

      return NextResponse.json({
        factorId: result.factorId,
        secret: result.secret,
        qrCodeUrl: result.qrCode,
      }, { status: 201 });
    } catch (error) {
      if (error instanceof AuthError) {
        const errorDto: ErrorResponseDto = { error: error.message, code: error.code };
        return NextResponse.json(errorDto, { status: 400 });
      }
      logger.error("Error enrolling MFA", error);
      const errorDto: ErrorResponseDto = { error: "Erreur lors de l'activation de l'A2F" };
      return NextResponse.json(errorDto, { status: 500 });
    }
  },
  { rateLimit: RateLimit.MFA, csrf: true }
);
