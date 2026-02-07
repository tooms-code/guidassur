import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/backend/application/services/AuthService";
import { AuthProvider } from "@/backend/domain/interfaces/IAuthProvider";
import { AuthError } from "@/backend/domain/errors/auth.errors";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  try {
    if (provider !== "google" && provider !== "facebook") {
      const error: ErrorResponseDto = { error: "Provider non supporté" };
      return NextResponse.json(error, { status: 400 });
    }

    const result = await authService.signInWithProvider(provider as AuthProvider);

    // The OAuth URL is returned in accessToken by the provider
    const oauthUrl = result.session.accessToken;

    if (!oauthUrl) {
      throw new Error("OAuth URL not returned");
    }

    // Redirect to OAuth provider - Supabase handles the rest
    return NextResponse.redirect(oauthUrl);
  } catch (error) {
    if (error instanceof AuthError) {
      const errorDto: ErrorResponseDto = { error: error.message, code: error.code };
      return NextResponse.json(errorDto, { status: 400 });
    }
    logger.error("OAuth error", error, { provider });
    const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
    return NextResponse.json(errorDto, { status: 500 });
  }
}
