import {
  IPaymentService,
  CreatePaymentParams,
} from "@/backend/domain/interfaces/IPaymentService";
import { Payment } from "@/backend/domain/entities/Payment";
import { getPaymentServiceProvider } from "@/backend/infrastructure/providers";

class PaymentService implements IPaymentService {
  private provider: IPaymentService;

  constructor() {
    this.provider = getPaymentServiceProvider();
  }

  async create(params: CreatePaymentParams): Promise<Payment> {
    return this.provider.create(params);
  }

  async markCompleted(
    stripeSessionId: string,
    paymentIntentId: string
  ): Promise<Payment | null> {
    return this.provider.markCompleted(stripeSessionId, paymentIntentId);
  }

  async markFailed(
    stripeSessionId: string,
    reason?: string
  ): Promise<Payment | null> {
    return this.provider.markFailed(stripeSessionId, reason);
  }

  async getByStripeSessionId(sessionId: string): Promise<Payment | null> {
    return this.provider.getByStripeSessionId(sessionId);
  }

  async getById(id: string): Promise<Payment | null> {
    return this.provider.getById(id);
  }

  async getByEmail(email: string): Promise<Payment[]> {
    return this.provider.getByEmail(email);
  }

  async getByUserId(userId: string): Promise<Payment[]> {
    return this.provider.getByUserId(userId);
  }

  async isSessionProcessed(sessionId: string): Promise<boolean> {
    return this.provider.isSessionProcessed(sessionId);
  }
}

export const paymentService = new PaymentService();
