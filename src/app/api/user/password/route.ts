import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthContext } from "@/backend/application/guards/AuthGuard";
import { authService } from "@/backend/application/services/AuthService";
import { ChangePasswordRequestDto } from "@/backend/application/dtos/user.dto";

async function handler(request: NextRequest, context: AuthContext) {
  try {
    const body: ChangePasswordRequestDto = await request.json();

    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: "Mot de passe actuel et nouveau requis" },
        { status: 400 }
      );
    }

    const result = await authService.changePassword(body.currentPassword, body.newPassword);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Erreur lors du changement de mot de passe" },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(handler);
