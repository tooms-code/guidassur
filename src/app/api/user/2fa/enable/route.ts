import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthContext } from "@/backend/application/guards/AuthGuard";
import { authService } from "@/backend/application/services/AuthService";

async function handler(request: NextRequest, context: AuthContext) {
  try {
    const result = await authService.enrollMFA();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      factorId: result.factorId,
      secret: result.secret,
      qrCodeUrl: result.qrCode,
    });
  } catch (error) {
    console.error("Error enabling 2FA:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'activation de l'A2F" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
