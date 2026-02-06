import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthContext } from "@/backend/application/guards/AuthGuard";
import { userService } from "@/backend/application/services/UserService";
import {
  GetAnalysesResponseDto,
  mapUserAnalysisToDto,
} from "@/backend/application/dtos/user.dto";
import { InsuranceType } from "@/shared/types/insurance";
import { AnalysisSortField, SortOrder } from "@/backend/domain/interfaces/IUserService";
import { logger } from "@/backend/infrastructure/utils/logger";

async function handler(request: NextRequest, context: AuthContext) {
  try {
    const { searchParams } = new URL(request.url);

    const insuranceType = searchParams.get("type") as InsuranceType | null;
    const isUnlocked = searchParams.get("unlocked");
    const sortBy = searchParams.get("sortBy") as AnalysisSortField | null;
    const sortOrder = searchParams.get("sortOrder") as SortOrder | null;
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const result = await userService.getAnalyses({
      userId: context.user.id,
      insuranceType: insuranceType || undefined,
      isUnlocked: isUnlocked !== null ? isUnlocked === "true" : undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });

    const response: GetAnalysesResponseDto = {
      data: result.analyses.map(mapUserAnalysisToDto),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      hasMore: result.hasMore,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error fetching user analyses", error, { userId: context.user.id });
    return NextResponse.json(
      { error: "Erreur lors de la récupération des analyses" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
