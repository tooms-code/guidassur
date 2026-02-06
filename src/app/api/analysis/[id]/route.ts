import { NextResponse } from "next/server";
import { createAuthHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { analysisService } from "@/backend/application/services/AnalysisService";
import { mapAnalysisToPublicDto } from "@/backend/application/dtos/analysis.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

export const GET = createAuthHandler<{ id: string }>(
  async (_request, { user, params }) => {
    const { id } = params;

    try {
      const analysis = await analysisService.getById(id);

      if (!analysis) {
        return NextResponse.json(
          { error: "Analyse introuvable" },
          { status: 404 }
        );
      }

      // Only the owner can view their analysis
      if (analysis.userId !== user.id) {
        return NextResponse.json(
          { error: "Accès non autorisé" },
          { status: 403 }
        );
      }

      // Return analysis (mapper handles filtering based on isUnlocked)
      const response = mapAnalysisToPublicDto(analysis);
      return NextResponse.json(response);
    } catch (error) {
      logger.error("Error fetching analysis", error, { analysisId: id });
      return NextResponse.json(
        { error: "Erreur lors de la récupération de l'analyse" },
        { status: 500 }
      );
    }
  },
  { rateLimit: RateLimit.GENERAL }
);
