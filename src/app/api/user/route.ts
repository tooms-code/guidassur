import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthContext } from "@/backend/application/guards/AuthGuard";
import { userService } from "@/backend/application/services/UserService";

async function handler(request: NextRequest, context: AuthContext) {
  try {
    const result = await userService.deleteAccount(context.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte" },
      { status: 500 }
    );
  }
}

export const DELETE = withAuth(handler);
