"use client";

import { useQuery } from "@tanstack/react-query";
import { PaymentDto, PaymentListDto } from "@/backend/application/dtos/payment.dto";
import { apiGet } from "@/frontend/lib/api";

// ===== Query Keys =====
export const paymentKeys = {
  all: ["payments"] as const,
  list: (params?: { limit?: number; offset?: number; status?: string }) =>
    [...paymentKeys.all, "list", params] as const,
};

// ===== Query Hooks =====
export function usePayments(params?: { limit?: number; offset?: number; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  if (params?.status) searchParams.set("status", params.status);

  const qs = searchParams.toString();
  const url = `/api/user/payments${qs ? `?${qs}` : ""}`;

  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => apiGet<PaymentListDto>(url, "Erreur lors du chargement des paiements"),
  });
}

// ===== Re-exports =====
export type { PaymentDto, PaymentListDto };
