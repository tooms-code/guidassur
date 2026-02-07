import { NextResponse } from "next/server";
import { createAuthHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { authService } from "@/backend/application/services/AuthService";
import { AuthError } from "@/backend/domain/errors/auth.errors";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

export const POST = createAuthHandler(
  async (request, { user }) => {
    try {
      await authService.resetPassword(user.email);

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      if (error instanceof AuthError) {
        const errorDto: ErrorResponseDto = { error: error.message, code: error.code };
        return NextResponse.json(errorDto, { status: 400 });
      }
      logger.error("Error requesting password reset", error, { email: user.email });
      const errorDto: ErrorResponseDto = { error: "Erreur lors de la demande de réinitialisation" };
      return NextResponse.json(errorDto, { status: 500 });
    }
  },
  { rateLimit: RateLimit.PASSWORD_RESET }
);
