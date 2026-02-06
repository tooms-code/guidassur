import { NextResponse } from "next/server";
import { createAuthHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { authService } from "@/backend/application/services/AuthService";
import { AuthError } from "@/backend/domain/interfaces/IAuthProvider";
import { ChangePasswordRequestDto } from "@/backend/application/dtos/user.dto";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

export const PUT = createAuthHandler(
  async (request, { user }) => {
    try {
      const body: ChangePasswordRequestDto = await request.json();

      if (!body.currentPassword || !body.newPassword) {
        const error: ErrorResponseDto = { error: "Mot de passe actuel et nouveau requis" };
        return NextResponse.json(error, { status: 400 });
      }

      await authService.changePassword(body.currentPassword, body.newPassword);

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      if (error instanceof AuthError) {
        const errorDto: ErrorResponseDto = { error: error.message, code: error.code };
        return NextResponse.json(errorDto, { status: 400 });
      }
      logger.error("Error changing password", error);
      const errorDto: ErrorResponseDto = { error: "Erreur lors du changement de mot de passe" };
      return NextResponse.json(errorDto, { status: 500 });
    }
  },
  { rateLimit: RateLimit.SENSITIVE, csrf: true }
);
