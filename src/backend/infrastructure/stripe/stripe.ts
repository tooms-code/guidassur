import Stripe from "stripe";

// Validate required environment variables at startup
function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not defined. Add it to your .env file."
    );
  }
  // Validate key format (starts with sk_test_ or sk_live_)
  if (!key.startsWith("sk_test_") && !key.startsWith("sk_live_")) {
    throw new Error(
      "STRIPE_SECRET_KEY must start with sk_test_ or sk_live_"
    );
  }
  return key;
}

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not defined. Add it to your .env file."
    );
  }
  return secret;
}

// Lazy initialization to avoid errors during build
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(getStripeSecretKey(), {
      apiVersion: "2026-01-28.clover",
      typescript: true,
      appInfo: {
        name: "GuidAssur",
        version: "1.0.0",
      },
    });
  }
  return stripeInstance;
}

export function getWebhookSecretKey(): string {
  return getWebhookSecret();
}

// Helper to get the app URL for redirects
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
