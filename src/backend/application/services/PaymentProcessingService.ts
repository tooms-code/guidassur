import { paymentService } from "@/backend/application/services/PaymentService";
import { analysisService } from "@/backend/application/services/AnalysisService";
import { userService } from "@/backend/application/services/UserService";
import { logger } from "@/backend/infrastructure/utils/logger";

export interface ProcessCreditsPurchaseParams {
  stripeSessionId: string;
  credits: number; // Credits amount from Stripe metadata
  userId: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paymentIntentId: string;
  analysisId?: string; // If provided, will use 1 credit to unlock this analysis
}

export interface ProcessingResult {
  success: boolean;
  alreadyProcessed: boolean;
  message: string;
}

class PaymentProcessingService {
  /**
   * Atomically process a credits purchase payment.
   * Credits come from session metadata (set by backend from Stripe product metadata).
   * If analysisId is provided, will use 1 credit to unlock the analysis immediately.
   */
  async processCreditsPurchase(
    params: ProcessCreditsPurchaseParams
  ): Promise<ProcessingResult & { newBalance?: number }> {
    const {
      stripeSessionId,
      credits,
      userId,
      customerEmail,
      amount,
      currency,
      paymentIntentId,
      analysisId,
    } = params;

    // Idempotency
    const alreadyProcessed =
      await paymentService.isSessionProcessed(stripeSessionId);
    if (alreadyProcessed) {
      return {
        success: true,
        alreadyProcessed: true,
        message: "Already processed",
      };
    }

    // Validate credits
    if (!credits || credits < 1) {
      logger.error("Invalid credits in payment", {
        stripeSessionId,
        credits,
      });
      return {
        success: false,
        alreadyProcessed: false,
        message: "Invalid credits",
      };
    }

    try {
      // Record payment
      await paymentService.create({
        stripeSessionId,
        type: "credits_purchase",
        creditsAmount: credits,
        analysisId, // Optional: link to analysis if unlocking
        userId,
        customerEmail,
        amount,
        currency,
      });

      // Add credits to user
      let newBalance = await userService.addCredits(userId, credits);

      // If analysisId provided, use 1 credit to unlock the analysis
      if (analysisId) {
        await userService.useCredit(userId);
        newBalance = newBalance - 1;

        const unlockedAnalysis = await analysisService.unlockAnalysis(analysisId);
        if (!unlockedAnalysis) {
          // REFUND: Add the credit back since unlock failed
          await userService.addCredits(userId, 1);
          newBalance = newBalance + 1;

          logger.error("Failed to unlock analysis after payment, refunded credit", {
            analysisId,
            userId,
            stripeSessionId
          });
          await paymentService.markFailed(stripeSessionId, "unlock_failed");
          return {
            success: false,
            alreadyProcessed: false,
            message: "Failed to unlock analysis",
          };
        }

        logger.info("Analysis unlocked via credits purchase", {
          analysisId,
          userId,
          stripeSessionId,
        });
      }

      // Mark completed
      await paymentService.markCompleted(stripeSessionId, paymentIntentId);

      logger.info("Credits added via payment", {
        userId,
        creditsAdded: credits,
        newBalance,
        analysisUnlocked: !!analysisId,
        stripeSessionId,
      });

      return {
        success: true,
        alreadyProcessed: false,
        message: analysisId
          ? `Added ${credits} credits and unlocked analysis`
          : `Added ${credits} credits`,
        newBalance,
      };
    } catch (error) {
      logger.error("Error processing credits purchase", error, {
        userId,
        credits,
        analysisId,
        stripeSessionId,
      });
      await paymentService.markFailed(stripeSessionId, "error");
      return {
        success: false,
        alreadyProcessed: false,
        message: "Error processing payment",
      };
    }
  }
}

export const paymentProcessingService = new PaymentProcessingService();
