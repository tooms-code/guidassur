import { NextResponse } from "next/server";
import { createHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { authService } from "@/backend/application/services/AuthService";
import { AuthError } from "@/backend/domain/interfaces/IAuthService";
import {
  LoginRequestDto,
  toAuthResponseDto,
  ErrorResponseDto,
} from "@/backend/application/dtos/auth.dto";
import { handleApiError } from "@/backend/infrastructure/api/errors";

export const POST = createHandler(
  async (request) => {
    try {
      const body: LoginRequestDto = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        const error: ErrorResponseDto = { error: "Email et mot de passe requis" };
        return NextResponse.json(error, { status: 400 });
      }

      const result = await authService.signInWithEmail(email, password);

      // Check if MFA is required
      const aalStatus = await authService.getAALStatus();
      const mfaRequired = aalStatus.nextLevel === "aal2" && aalStatus.currentLevel !== aalStatus.nextLevel;

      if (mfaRequired) {
        // User has MFA enabled, need to verify
        const mfaStatus = await authService.getMFAStatus();
        return NextResponse.json({
          user: null,
          expiresAt: 0,
          mfaRequired: true,
          factorId: mfaStatus.factorId,
        });
      }

      const response = toAuthResponseDto(result.user, result.session.expiresAt);
      return NextResponse.json(response);
    } catch (error) {
      if (error instanceof AuthError) {
        // Always return same generic message to prevent user enumeration
        const errorDto: ErrorResponseDto = { error: "Email ou mot de passe incorrect" };
        return NextResponse.json(errorDto, { status: 401 });
      }
      return handleApiError(error, "Login error");
    }
  },
  { rateLimit: RateLimit.AUTH, csrf: true }
);
