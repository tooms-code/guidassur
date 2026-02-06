// Unified: buying credits (optionally to unlock an analysis immediately)
export interface CreateCreditsCheckoutParams {
  priceId: string; // Stripe price_id directly
  userId: string;
  customerEmail?: string;
  analysisId?: string; // If provided, will unlock this analysis after adding credits
  successUrl?: string;
  cancelUrl?: string;
}

// Credit packages available for purchase
export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number; // in cents
  priceId: string; // Stripe price ID
  popular?: boolean;
  savings?: string; // e.g., "-50%"
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface WebhookEventMetadata {
  analysisId: string;
  userId?: string;
}

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface PaymentRecord {
  id: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  analysisId: string;
  userId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  customerEmail?: string;
  createdAt: Date;
  completedAt?: Date;
}
