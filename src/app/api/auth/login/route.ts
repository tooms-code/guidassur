import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/backend/application/services/AuthService";
import { cookies } from "next/headers";
import {
  LoginRequestDto,
  toAuthResponseDto,
  ErrorResponseDto,
} from "@/backend/application/dtos/auth.dto";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequestDto = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      const error: ErrorResponseDto = { error: "Email et mot de passe requis" };
      return NextResponse.json(error, { status: 400 });
    }

    const result = await authService.signInWithEmail(email, password);

    if (!result.success) {
      const error: ErrorResponseDto = {
        error: result.error.message,
        code: result.error.code,
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Set HTTP-only cookies for tokens
    const cookieStore = await cookies();

    cookieStore.set("access_token", result.session.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600,
      path: "/",
    });

    cookieStore.set("refresh_token", result.session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    const response = toAuthResponseDto(result.user, result.session.expiresAt);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Login error:", error);
    const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
    return NextResponse.json(errorDto, { status: 500 });
  }
}
