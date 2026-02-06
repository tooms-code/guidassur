import { Payment, PaymentType } from "@/backend/domain/entities/Payment";

export interface CreatePaymentParams {
  stripeSessionId: string;
  type: PaymentType;
  analysisId?: string;
  packageId?: string;
  creditsAmount?: number;
  userId?: string;
  customerEmail: string;
  amount: number;
  currency: string;
}

export interface IPaymentService {
  // Create a pending payment record
  create(params: CreatePaymentParams): Promise<Payment>;

  // Update payment status (called by webhook)
  markCompleted(stripeSessionId: string, paymentIntentId: string): Promise<Payment | null>;
  markFailed(stripeSessionId: string, reason?: string): Promise<Payment | null>;

  // Query payments
  getByStripeSessionId(sessionId: string): Promise<Payment | null>;
  getByEmail(email: string): Promise<Payment[]>;
  getByUserId(userId: string): Promise<Payment[]>;
  getById(id: string): Promise<Payment | null>;

  // Check if session was already processed (idempotency)
  isSessionProcessed(sessionId: string): Promise<boolean>;
}
