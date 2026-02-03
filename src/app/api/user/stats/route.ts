import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthContext } from "@/backend/application/guards/AuthGuard";
import { userService } from "@/backend/application/services/UserService";
import { mapUserStatsToDto } from "@/backend/application/dtos/user.dto";

async function handler(request: NextRequest, context: AuthContext) {
  try {
    const stats = await userService.getStats(context.user.id);
    const response = mapUserStatsToDto(stats);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
