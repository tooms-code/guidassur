import { NextResponse } from "next/server";
import { createHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { authService } from "@/backend/application/services/AuthService";
import { AuthError } from "@/backend/domain/interfaces/IAuthService";
import {
  RegisterRequestDto,
  toAuthResponseDto,
  ErrorResponseDto,
} from "@/backend/application/dtos/auth.dto";
import { handleApiError } from "@/backend/infrastructure/api/errors";
import { isValidPassword } from "@/backend/infrastructure/api/validation";

export const POST = createHandler(
  async (request) => {
    try {
      const body: RegisterRequestDto = await request.json();
      const { email, password, fullName } = body;

      if (!email || !password) {
        const error: ErrorResponseDto = { error: "Email et mot de passe requis" };
        return NextResponse.json(error, { status: 400 });
      }

      // Validate password strength
      const passwordValidation = isValidPassword(password);
      if (!passwordValidation.valid) {
        const error: ErrorResponseDto = { error: passwordValidation.error! };
        return NextResponse.json(error, { status: 400 });
      }

      const result = await authService.signUp(email, password, fullName);

      const response = toAuthResponseDto(result.user, result.session.expiresAt);
      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      if (error instanceof AuthError) {
        // Always return 400 with generic message to prevent email enumeration
        const errorDto: ErrorResponseDto = { error: "Impossible de créer le compte. Veuillez vérifier vos informations." };
        return NextResponse.json(errorDto, { status: 400 });
      }
      return handleApiError(error, "Register error");
    }
  },
  { rateLimit: RateLimit.AUTH, csrf: true }
);
