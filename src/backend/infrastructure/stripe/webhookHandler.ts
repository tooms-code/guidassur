import Stripe from "stripe";
import { getStripe, getWebhookSecretKey } from "./stripe";
import { paymentService } from "@/backend/application/services/PaymentService";
import { paymentProcessingService } from "@/backend/application/services/PaymentProcessingService";
import { logger } from "@/backend/infrastructure/utils/logger";

// ============================================
// Event handling
// ============================================
const HANDLED_EVENTS = [
  "checkout.session.completed",
  "checkout.session.expired",
  "payment_intent.payment_failed",
] as const;

type HandledEventType = (typeof HANDLED_EVENTS)[number];

export function isHandledEvent(type: string): type is HandledEventType {
  return HANDLED_EVENTS.includes(type as HandledEventType);
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const stripe = getStripe();
  const webhookSecret = getWebhookSecretKey();

  // Verify webhook signature - throws if invalid
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export async function handleWebhookEvent(
  event: Stripe.Event
): Promise<{ handled: boolean; message: string }> {
  const eventType = event.type;

  logger.info("Processing webhook event", {
    eventId: event.id,
    eventType,
  });

  if (!isHandledEvent(eventType)) {
    return { handled: false, message: `Event type ${eventType} not handled` };
  }

  switch (eventType) {
    case "checkout.session.completed":
      return handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session
      );
    case "checkout.session.expired":
      return handleCheckoutExpired(
        event.data.object as Stripe.Checkout.Session
      );
    case "payment_intent.payment_failed":
      return handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
    default:
      return { handled: false, message: `Unhandled event type: ${eventType}` };
  }
}

// ============================================
// Checkout completed
// ============================================
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<{ handled: boolean; message: string }> {
  const sessionId = session.id;

  // Idempotency check - don't process twice
  const alreadyProcessed = await paymentService.isSessionProcessed(sessionId);
  if (alreadyProcessed) {
    logger.info("Session already processed, skipping", { sessionId });
    return { handled: true, message: "Already processed" };
  }

  // Verify payment is actually paid
  if (session.payment_status !== "paid") {
    logger.warn("Checkout completed but payment not paid", {
      sessionId,
      paymentStatus: session.payment_status,
    });
    return { handled: false, message: "Payment not completed" };
  }

  const type = session.metadata?.type;
  const customerEmail =
    session.customer_details?.email || session.customer_email || "unknown";
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || "";

  // Route to appropriate handler
  switch (type) {
    case "credits_purchase":
      return handleCreditsPurchasePayment(session, customerEmail, paymentIntentId);
    default:
      logger.error("Unknown checkout type", { sessionId, type });
      return { handled: false, message: `Unknown checkout type: ${type}` };
  }
}

// ============================================
// Credits purchase payment (with optional analysis unlock)
// ============================================
async function handleCreditsPurchasePayment(
  session: Stripe.Checkout.Session,
  customerEmail: string,
  paymentIntentId: string
): Promise<{ handled: boolean; message: string }> {
  const userId = session.metadata?.userId;
  const creditsStr = session.metadata?.credits;
  const analysisId = session.metadata?.analysisId; // Optional: if unlocking an analysis

  if (!userId) {
    logger.error("Credits purchase without userId", { sessionId: session.id });
    return { handled: false, message: "Missing userId in metadata" };
  }

  if (!creditsStr) {
    logger.error("Credits purchase without credits", { sessionId: session.id });
    return { handled: false, message: "Missing credits in metadata" };
  }

  const credits = parseInt(creditsStr, 10);
  if (isNaN(credits) || credits < 1) {
    logger.error("Invalid credits in metadata", { sessionId: session.id, creditsStr });
    return { handled: false, message: "Invalid credits value" };
  }

  const result = await paymentProcessingService.processCreditsPurchase({
    stripeSessionId: session.id,
    credits,
    userId,
    customerEmail,
    amount: session.amount_total || 0,
    currency: session.currency || "eur",
    paymentIntentId,
    analysisId, // Optional: will unlock if provided
  });

  return { handled: result.success, message: result.message };
}

// ============================================
// Checkout expired
// ============================================
async function handleCheckoutExpired(
  session: Stripe.Checkout.Session
): Promise<{ handled: boolean; message: string }> {
  const sessionId = session.id;
  const analysisId = session.metadata?.analysisId;

  logger.info("Checkout session expired", { sessionId, analysisId });

  // Mark as failed if we had a record
  await paymentService.markFailed(sessionId, "expired");

  return { handled: true, message: "Checkout expired acknowledged" };
}

// ============================================
// Payment failed
// ============================================
async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<{ handled: boolean; message: string }> {
  const errorMessage = paymentIntent.last_payment_error?.message;

  logger.warn("Payment failed", {
    paymentIntentId: paymentIntent.id,
    error: errorMessage,
  });

  // User will see error on Stripe checkout page
  return { handled: true, message: "Payment failure acknowledged" };
}
