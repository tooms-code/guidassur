import Stripe from "stripe";
import {
  getStripe,
  getAppUrl,
} from "./stripe";
import type {
  CreateCreditsCheckoutParams,
  CheckoutSessionResult,
} from "./types";
import { paymentService } from "@/backend/application/services/PaymentService";
import { logger } from "@/backend/infrastructure/utils/logger";

// ============================================
// Base checkout session builder (DRY)
// ============================================
interface BaseSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
  customerEmail?: string;
}

async function createBaseCheckoutSession(
  params: BaseSessionParams
): Promise<CheckoutSessionResult> {
  const stripe = getStripe();

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
    billing_address_collection: "auto",
    allow_promotion_codes: true,
  };

  if (params.customerEmail) {
    sessionParams.customer_email = params.customerEmail;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  if (!session.url) {
    throw new Error("Stripe session created without URL");
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

// ============================================
// Credits purchase checkout (unified)
// If analysisId is provided, credits will be used to unlock that analysis
// ============================================
export async function createCreditsCheckoutSession(
  params: CreateCreditsCheckoutParams
): Promise<CheckoutSessionResult> {
  const appUrl = getAppUrl();
  const stripe = getStripe();
  const { priceId, userId, customerEmail, analysisId } = params;

  try {
    // Fetch price from Stripe to get credits from product metadata
    const price = await stripe.prices.retrieve(priceId, {
      expand: ["product"],
    });

    const product = price.product as Stripe.Product;
    const credits = parseInt(product.metadata?.credits || "1");

    // If analysisId provided, this is an unlock payment
    // Redirect to analysis result page on success
    const successUrl = analysisId
      ? params.successUrl || `${appUrl}/resultat/${analysisId}?payment=success&session_id={CHECKOUT_SESSION_ID}`
      : params.successUrl || `${appUrl}/compte?payment=success&credits=${credits}&session_id={CHECKOUT_SESSION_ID}`;

    const cancelUrl = analysisId
      ? params.cancelUrl || `${appUrl}/resultat/${analysisId}?payment=cancelled`
      : params.cancelUrl || `${appUrl}/checkout/cancel?priceId=${priceId}`;

    const metadata: Record<string, string> = {
      type: "credits_purchase",
      userId,
      credits: credits.toString(),
    };

    // Add analysisId if this is an unlock payment
    if (analysisId) {
      metadata.analysisId = analysisId;
    }

    const result = await createBaseCheckoutSession({
      priceId,
      successUrl,
      cancelUrl,
      metadata,
      customerEmail,
    });

    logger.info("Credits checkout session created", {
      sessionId: result.sessionId,
      priceId,
      credits,
      userId,
      analysisId: analysisId || "none",
    });

    return result;
  } catch (error) {
    logger.error("Failed to create credits checkout session", error, {
      priceId,
      userId,
      analysisId,
    });
    throw error;
  }
}

// ============================================
// Session retrieval & verification
// ============================================
export async function retrieveCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
}

