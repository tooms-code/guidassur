import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "@/backend/infrastructure/stubs/StubAuthService";
import { OAuthProvider } from "@/backend/domain/interfaces/IAuthService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const code = request.nextUrl.searchParams.get("code");

    if (provider !== "google" && provider !== "facebook") {
      return NextResponse.redirect(new URL("/login?error=invalid_provider", request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/login?error=no_code", request.url));
    }

    // Handle OAuth callback (stub implementation)
    const result = await authService.handleOAuthCallback(
      provider as OAuthProvider,
      code
    );

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/login?error=${result.error.code}`, request.url)
      );
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

    // Redirect to account page
    return NextResponse.redirect(new URL("/compte", request.url));
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/login?error=server_error", request.url));
  }
}
