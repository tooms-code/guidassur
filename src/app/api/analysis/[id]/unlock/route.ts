import { NextResponse } from "next/server";
import { createAuthHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { analysisService } from "@/backend/application/services/AnalysisService";
import { userService } from "@/backend/application/services/UserService";
import { mapAnalysisToPublicDto } from "@/backend/application/dtos/analysis.dto";
import { handleApiError } from "@/backend/infrastructure/api/errors";
import { logger } from "@/backend/infrastructure/utils/logger";

export const POST = createAuthHandler<{ id: string }>(
  async (request, { user, params }) => {
    const { id } = params;

    try {
      const body = await request.json().catch(() => ({}));
      const { useCredit } = body;

      // Check if analysis exists
      const existingAnalysis = await analysisService.getById(id);

      if (!existingAnalysis) {
        return NextResponse.json(
          { error: "Analyse introuvable" },
          { status: 404 }
        );
      }

      // Already unlocked?
      if (existingAnalysis.isUnlocked) {
        if (existingAnalysis.userId !== user.id) {
          return NextResponse.json(
            { error: "Accès non autorisé" },
            { status: 403 }
          );
        }
        const response = mapAnalysisToPublicDto(existingAnalysis);
        return NextResponse.json(response);
      }

      // Always verify ownership (user_id is NOT NULL in DB)
      if (existingAnalysis.userId !== user.id) {
        return NextResponse.json(
          { error: "Cette analyse ne vous appartient pas" },
          { status: 403 }
        );
      }

      // === Use existing credit ===
      if (useCredit) {
        const creditResult = await userService.useCredit(user.id);

        if (!creditResult.success) {
          return NextResponse.json(
            { error: "Crédits insuffisants" },
            { status: 402 }
          );
        }

        // Unlock the analysis
        const unlockedAnalysis = await analysisService.unlockAnalysis(id);

        if (!unlockedAnalysis) {
          // Refund the credit if unlock failed
          await userService.addCredits(user.id, 1);
          return NextResponse.json(
            { error: "Erreur lors du déblocage" },
            { status: 500 }
          );
        }

        logger.info("Analysis unlocked with credit", {
          analysisId: id,
          remainingCredits: creditResult.remaining,
        });

        const response = mapAnalysisToPublicDto(unlockedAnalysis);
        return NextResponse.json({
          ...response,
          creditsRemaining: creditResult.remaining,
        });
      }

      // === No credit → need to pay ===
      return NextResponse.json(
        { error: "Paiement requis" },
        { status: 402 }
      );
    } catch (error) {
      return handleApiError(error, `Error unlocking analysis ${id}`);
    }
  },
  { rateLimit: RateLimit.PAYMENT, csrf: true }
);
