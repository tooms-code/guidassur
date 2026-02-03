import { NextResponse } from "next/server";
import { authService } from "@/backend/application/services/AuthService";
import { cookies } from "next/headers";
import {
  MeResponseDto,
  toUserDto,
  ErrorResponseDto,
} from "@/backend/application/dtos/auth.dto";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      const response: MeResponseDto = { user: null };
      return NextResponse.json(response);
    }

    // For stub: getCurrentUser returns the stored user
    // For Supabase: would validate token and get user from session
    const user = authService.getCurrentUser();

    if (!user) {
      // Token expired or invalid
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");

      const response: MeResponseDto = { user: null };
      return NextResponse.json(response);
    }

    const response: MeResponseDto = { user: toUserDto(user) };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Get user error:", error);
    const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
    return NextResponse.json(errorDto, { status: 500 });
  }
}
