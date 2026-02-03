import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthContext } from "@/backend/application/guards/AuthGuard";
import { authService } from "@/backend/application/services/AuthService";
import { Disable2FARequestDto } from "@/backend/application/dtos/user.dto";

async function handler(request: NextRequest, context: AuthContext) {
  try {
    const body: Disable2FARequestDto = await request.json();

    if (!body.code) {
      return NextResponse.json(
        { error: "Code requis" },
        { status: 400 }
      );
    }

    // Get the current MFA status to retrieve the factorId
    const mfaStatus = await authService.getMFAStatus();
    if (!mfaStatus.factorId || !mfaStatus.enabled) {
      return NextResponse.json(
        { error: "L'A2F n'est pas activée" },
        { status: 400 }
      );
    }

    const result = await authService.unenrollMFA(mfaStatus.factorId, body.code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    return NextResponse.json(
      { error: "Erreur lors de la désactivation de l'A2F" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
