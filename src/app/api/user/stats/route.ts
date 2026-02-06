import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthContext } from "@/backend/application/guards/AuthGuard";
import { userService } from "@/backend/application/services/UserService";
import { mapUserStatsToDto } from "@/backend/application/dtos/user.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

async function handler(request: NextRequest, context: AuthContext) {
  try {
    const stats = await userService.getStats(context.user.id);
    const response = mapUserStatsToDto(stats);

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error fetching user stats", error, { userId: context.user.id });
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
