import { Payment, PaymentStatus } from "@/backend/domain/entities/Payment";
import { PaginatedResponse } from "@/shared/types/pagination";

// ===== Response DTOs =====

export interface PaymentDto {
  id: string;
  description: string;
  amount: string;
  status: string;
  canRefund: boolean;
  analysisId?: string;
  createdAt: string;
}

export type PaymentListDto = PaginatedResponse<PaymentDto>;

// ===== Mappers =====

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "En attente",
  completed: "Complété",
  failed: "Échoué",
  refunded: "Remboursé",
};

function formatAmount(cents: number, currency: string): string {
  const value = cents / 100;
  if (currency.toLowerCase() === "eur") {
    return `${value.toFixed(2).replace(".", ",")} €`;
  }
  return `${value.toFixed(2)} ${currency.toUpperCase()}`;
}

function getDescription(payment: Payment): string {
  if (payment.type === "credits_purchase" && payment.creditsAmount) {
    // If analysisId present, this was an unlock payment
    if (payment.analysisId) {
      return `Déblocage d'une analyse (1 crédit)`;
    }
    return `Pack de ${payment.creditsAmount} crédit${payment.creditsAmount > 1 ? "s" : ""}`;
  }
  return "Déblocage d'une analyse";
}

export function mapPaymentToDto(payment: Payment): PaymentDto {
  return {
    id: payment.id,
    description: getDescription(payment),
    amount: formatAmount(payment.amount, payment.currency),
    status: STATUS_LABELS[payment.status],
    canRefund: payment.status === "completed",
    analysisId: payment.analysisId && payment.status === "completed"
      ? payment.analysisId
      : undefined,
    createdAt: payment.createdAt.toISOString(),
  };
}
