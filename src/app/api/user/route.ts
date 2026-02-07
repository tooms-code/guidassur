import { NextResponse } from "next/server";
import { createAuthHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { userService } from "@/backend/application/services/UserService";
import { authService } from "@/backend/application/services/AuthService";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { DeleteAccountRequestDto } from "@/backend/application/dtos/user.dto";
import { AuthError } from "@/backend/domain/errors/auth.errors";
import { logger } from "@/backend/infrastructure/utils/logger";

export const DELETE = createAuthHandler(
  async (request, { user }) => {
    try {
      const body: DeleteAccountRequestDto = await request.json().catch(() => ({}));

      if (!body.password) {
        const errorDto: ErrorResponseDto = { error: "Mot de passe requis pour confirmer la suppression" };
        return NextResponse.json(errorDto, { status: 400 });
      }

      // Verify password before deletion
      const isValid = await authService.verifyPassword(body.password);
      if (!isValid) {
        const errorDto: ErrorResponseDto = { error: "Mot de passe incorrect" };
        return NextResponse.json(errorDto, { status: 401 });
      }

      // Check if MFA is enabled
      const mfaStatus = await authService.getMFAStatus();
      if (mfaStatus.enabled && mfaStatus.factorId) {
        // MFA is enabled, require code
        if (!body.mfaCode) {
          const errorDto: ErrorResponseDto = {
            error: "Code MFA requis pour supprimer le compte",
            code: "mfa_required",
          };
          return NextResponse.json(errorDto, { status: 403 });
        }

        // Verify MFA code
        try {
          await authService.challengeMFA(mfaStatus.factorId, body.mfaCode);
        } catch (error) {
          if (error instanceof AuthError && error.code === "invalid_code") {
            const errorDto: ErrorResponseDto = { error: "Code MFA invalide", code: "invalid_mfa_code" };
            return NextResponse.json(errorDto, { status: 401 });
          }
          throw error;
        }
      }

      await userService.deleteAccount(user.id);

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      logger.error("Error deleting account", error, { userId: user.id });
      const errorDto: ErrorResponseDto = { error: "Erreur lors de la suppression du compte" };
      return NextResponse.json(errorDto, { status: 500 });
    }
  },
  { rateLimit: RateLimit.AUTH, csrf: true }
);
