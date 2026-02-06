import { NextResponse } from "next/server";
import { createHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { createCreditsCheckoutSession } from "@/backend/infrastructure/stripe";
import { analysisService } from "@/backend/application/services/AnalysisService";
import { logger } from "@/backend/infrastructure/utils/logger";

export const POST = createHandler(
  async (request, { user }) => {
    try {
      const body = await request.json();
      const { priceId, analysisId } = body;

      // Auth required
      if (!user) {
        return NextResponse.json(
          { error: "Connexion requise" },
          { status: 401 }
        );
      }

      // Email verification required
      if (!user.emailVerified) {
        return NextResponse.json(
          { error: "Veuillez confirmer votre adresse email avant d'acheter des crédits" },
          { status: 403 }
        );
      }

      // Validate priceId
      if (!priceId) {
        return NextResponse.json(
          { error: "priceId requis" },
          { status: 400 }
        );
      }

      if (!priceId.startsWith("price_")) {
        return NextResponse.json(
          { error: "priceId invalide" },
          { status: 400 }
        );
      }

      // If analysisId provided, verify it exists and is not already unlocked
      if (analysisId) {
        const analysis = await analysisService.getById(analysisId);
        if (!analysis) {
          return NextResponse.json(
            { error: "Analyse introuvable" },
            { status: 404 }
          );
        }

        if (analysis.isUnlocked) {
          return NextResponse.json(
            { error: "Analyse déjà débloquée" },
            { status: 400 }
          );
        }
      }

      // Create checkout session (with optional analysisId for immediate unlock)
      const session = await createCreditsCheckoutSession({
        priceId,
        userId: user.id,
        customerEmail: user.email,
        analysisId, // Optional: if provided, will unlock after payment
      });

      return NextResponse.json({
        sessionId: session.sessionId,
        url: session.url,
      });
    } catch (error) {
      logger.error("Error creating checkout session", error);
      return NextResponse.json(
        { error: "Erreur lors de la création du paiement" },
        { status: 500 }
      );
    }
  },
  { rateLimit: RateLimit.PAYMENT, csrf: true }
);
