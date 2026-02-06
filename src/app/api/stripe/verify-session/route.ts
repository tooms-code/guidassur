import { NextResponse } from "next/server";
import { createHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { getStripe } from "@/backend/infrastructure/stripe/stripe";
import { paymentService } from "@/backend/application/services/PaymentService";
import { paymentProcessingService } from "@/backend/application/services/PaymentProcessingService";
import { logger } from "@/backend/infrastructure/utils/logger";

/**
 * Verify a Stripe session and process payment if webhook hasn't yet.
 * This is a fallback for when the redirect beats the webhook.
 */
export const POST = createHandler(
  async (request, { user }) => {
    try {
      const { sessionId } = await request.json();

      if (!sessionId || typeof sessionId !== "string") {
        return NextResponse.json(
          { error: "sessionId requis" },
          { status: 400 }
        );
      }

      // Check if already processed (idempotency)
      const alreadyProcessed = await paymentService.isSessionProcessed(sessionId);
      if (alreadyProcessed) {
        return NextResponse.json({ success: true, alreadyProcessed: true });
      }

      // Verify with Stripe
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      // Not paid yet
      if (session.payment_status !== "paid") {
        return NextResponse.json(
          { success: false, reason: "payment_not_completed" },
          { status: 400 }
        );
      }

      const sessionUserId = session.metadata?.userId;

      // Security: verify the session belongs to this user (if both are present)
      if (user && sessionUserId && user.id !== sessionUserId) {
        logger.warn("Session userId mismatch in verify", {
          sessionId,
          sessionUserId,
          currentUserId: user.id,
        });
        return NextResponse.json(
          { error: "Session invalide" },
          { status: 403 }
        );
      }

      const customerEmail = session.customer_details?.email || session.customer_email || "unknown";
      const paymentIntentId = typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || "";
      const type = session.metadata?.type;

      // Process credits purchase (with optional analysis unlock)
      if (type === "credits_purchase") {
        const creditsStr = session.metadata?.credits;
        const analysisId = session.metadata?.analysisId; // Optional

        if (!sessionUserId || !creditsStr) {
          return NextResponse.json(
            { error: "Données de session invalides" },
            { status: 400 }
          );
        }

        const credits = parseInt(creditsStr, 10);
        if (isNaN(credits) || credits < 1) {
          return NextResponse.json(
            { error: "Nombre de crédits invalide" },
            { status: 400 }
          );
        }

        // Security: only the session owner can verify credits purchase
        if (!user || user.id !== sessionUserId) {
          return NextResponse.json(
            { error: "Non autorisé" },
            { status: 403 }
          );
        }

        const result = await paymentProcessingService.processCreditsPurchase({
          stripeSessionId: sessionId,
          credits,
          userId: sessionUserId,
          customerEmail,
          amount: session.amount_total || 0,
          currency: session.currency || "eur",
          paymentIntentId,
          analysisId, // Optional: will unlock if provided
        });

        if (!result.success) {
          return NextResponse.json(
            { error: "Erreur lors du traitement" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          newBalance: result.newBalance,
          analysisId: analysisId || undefined,
        });
      }

      return NextResponse.json(
        { error: "Type de paiement inconnu" },
        { status: 400 }
      );
    } catch (error) {
      logger.error("Error in verify-session", error);
      return NextResponse.json(
        { error: "Erreur de vérification" },
        { status: 500 }
      );
    }
  },
  { rateLimit: RateLimit.PAYMENT, csrf: true }
);
