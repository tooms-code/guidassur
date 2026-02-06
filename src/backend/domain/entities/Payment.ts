export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type PaymentType = "credits_purchase";

export interface Payment {
  id: string;

  // Stripe identifiers
  stripeSessionId: string;
  stripePaymentIntentId?: string;

  // What was purchased
  type: PaymentType;
  analysisId?: string; // If present, this credit was used to unlock this analysis
  creditsAmount?: number; // Number of credits purchased

  // Who paid
  userId?: string;
  customerEmail: string;

  // Payment details
  amount: number; // In cents
  currency: string;
  status: PaymentStatus;

  // Timestamps
  createdAt: Date;
  completedAt?: Date;
}
