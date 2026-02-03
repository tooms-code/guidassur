import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "@/backend/application/services/AuthService";
import { AuthProvider } from "@/backend/domain/interfaces/IAuthProvider";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;

    if (provider !== "google" && provider !== "facebook") {
      return NextResponse.json(
        { error: "Provider non supporté" },
        { status: 400 }
      );
    }

    const result = await authService.signInWithProvider(provider as AuthProvider);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    // For stub: sign in directly and redirect to dashboard
    // For Supabase: would redirect to OAuth provider URL
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

    // Redirect to dashboard after successful login
    const redirectUrl = new URL("/compte", request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("OAuth error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
