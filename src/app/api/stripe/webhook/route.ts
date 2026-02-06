import { NextRequest, NextResponse } from "next/server";
import {
  constructWebhookEvent,
  handleWebhookEvent,
} from "@/backend/infrastructure/stripe/webhookHandler";
import { logger } from "@/backend/infrastructure/utils/logger";

// Disable body parsing - we need the raw body for signature verification
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Get the raw body as text for signature verification
    const payload = await request.text();

    // Get Stripe signature header
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      logger.warn("Webhook called without stripe-signature header");
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Verify signature and construct event
    let event;
    try {
      event = await constructWebhookEvent(payload, signature);
    } catch (err) {
      logger.error("Webhook signature verification failed", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Process the event
    const result = await handleWebhookEvent(event);

    logger.info("Webhook processed", {
      eventId: event.id,
      eventType: event.type,
      handled: result.handled,
      message: result.message,
    });

    // Always return 200 to acknowledge receipt
    // Even if we don't handle the event, we don't want Stripe to retry
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook error", error);
    // Return 500 so Stripe retries
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
