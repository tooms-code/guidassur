import { NextResponse } from "next/server";
import { authService } from "@/backend/application/services/AuthService";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token" },
        { status: 401 }
      );
    }

    const result = await authService.refreshSession(refreshToken);

    if (!result.success) {
      // Clear invalid tokens
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");

      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // Update access token cookie
    cookieStore.set("access_token", result.session.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
      path: "/",
    });

    return NextResponse.json({
      expiresAt: result.session.expiresAt,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
