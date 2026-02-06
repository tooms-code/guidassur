import {
  IPaymentService,
  CreatePaymentParams,
} from "@/backend/domain/interfaces/IPaymentService";
import { Payment, PaymentStatus } from "@/backend/domain/entities/Payment";
import { createAdminClient, createSupabaseServerClient } from "./client";
import { logger } from "@/backend/infrastructure/utils/logger";
import type { Payment as PaymentRow } from "./types";

class SupabasePaymentService implements IPaymentService {
  async create(params: CreatePaymentParams): Promise<Payment> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("payments")
      .insert({
        stripe_session_id: params.stripeSessionId,
        type: params.type,
        user_id: params.userId || null,
        customer_email: params.customerEmail,
        amount: params.amount,
        currency: params.currency,
        analysis_id: params.analysisId || null,
        package_id: params.packageId || null,
        credits_amount: params.creditsAmount || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      logger.error("Error creating payment", error);
      throw new Error("Erreur lors de la création du paiement");
    }

    return this.toPayment(data);
  }

  async markCompleted(
    stripeSessionId: string,
    paymentIntentId: string
  ): Promise<Payment | null> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("payments")
      .update({
        status: "completed",
        stripe_payment_intent_id: paymentIntentId,
      })
      .eq("stripe_session_id", stripeSessionId)
      .select()
      .single();

    if (error) {
      logger.error("Error marking payment completed", error);
      return null;
    }

    return this.toPayment(data);
  }

  async markFailed(
    stripeSessionId: string,
    reason?: string
  ): Promise<Payment | null> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("payments")
      .update({
        status: "failed",
        failure_reason: reason || null,
      })
      .eq("stripe_session_id", stripeSessionId)
      .select()
      .single();

    if (error) {
      logger.error("Error marking payment failed", error);
      return null;
    }

    return this.toPayment(data);
  }

  async getByStripeSessionId(sessionId: string): Promise<Payment | null> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("payments")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.toPayment(data);
  }

  async getById(id: string): Promise<Payment | null> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.toPayment(data);
  }

  async getByEmail(email: string): Promise<Payment[]> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("payments")
      .select("*")
      .eq("customer_email", email)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error getting payments by email", error);
      return [];
    }

    return (data || []).map((row) => this.toPayment(row));
  }

  async getByUserId(userId: string): Promise<Payment[]> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error getting payments by userId", error);
      return [];
    }

    return (data || []).map((row) => this.toPayment(row));
  }

  async getByUserIdPaginated(
    userId: string,
    options: { limit: number; offset: number; status?: string }
  ): Promise<{ payments: Payment[]; total: number }> {
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("payments")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    if (options.status) {
      query = query.eq("status", options.status);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(options.offset, options.offset + options.limit - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error("Error getting paginated payments", error);
      return { payments: [], total: 0 };
    }

    return {
      payments: (data || []).map((row) => this.toPayment(row)),
      total: count || 0,
    };
  }

  async isSessionProcessed(sessionId: string): Promise<boolean> {
    const adminClient = createAdminClient();

    const { data } = await adminClient
      .from("payments")
      .select("status")
      .eq("stripe_session_id", sessionId)
      .single();

    return data?.status === "completed";
  }

  private toPayment(data: PaymentRow): Payment {
    return {
      id: data.id,
      stripeSessionId: data.stripe_session_id,
      stripePaymentIntentId: data.stripe_payment_intent_id ?? undefined,
      type: data.type as Payment["type"],
      status: data.status as PaymentStatus,
      amount: data.amount,
      currency: data.currency,
      analysisId: data.analysis_id ?? undefined,
      creditsAmount: data.credits_amount ?? undefined,
      userId: data.user_id ?? undefined,
      customerEmail: data.customer_email ?? "",
      createdAt: new Date(data.created_at),
      completedAt: data.status === "completed" ? new Date(data.updated_at) : undefined,
    };
  }
}

export const supabasePaymentService = new SupabasePaymentService();
