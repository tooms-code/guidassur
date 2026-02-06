"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "./auth";
import { paymentKeys } from "./payments";
import { apiPost } from "@/frontend/lib/api";

// ===== Types =====
export interface CheckoutResult {
  sessionId: string;
  url: string;
}

export interface CreditsCheckoutParams {
  priceId: string;
  analysisId?: string; // If provided, will unlock this analysis after purchase
}

export interface VerifySessionParams {
  sessionId: string;
}

export interface VerifySessionResult {
  success: boolean;
  alreadyProcessed?: boolean;
  credits?: number;
  newBalance?: number;
  analysisId?: string;
}

// ===== Mutation Hooks =====
/**
 * Unified checkout hook for buying credits.
 * If analysisId is provided, will unlock that analysis after purchase.
 */
export function useCreditsCheckout() {
  return useMutation({
    mutationFn: (params: CreditsCheckoutParams) =>
      apiPost<CheckoutResult>("/api/stripe/checkout", {
        priceId: params.priceId,
        analysisId: params.analysisId, // Optional: unlock analysis
      }, "Erreur lors de la création du paiement"),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
}

/**
 * @deprecated Use useCreditsCheckout() with analysisId instead
 * Kept for backward compatibility
 */
export function useAnalysisUnlockCheckout() {
  return useCreditsCheckout();
}

// ===== Session Verification =====
export function useVerifyStripeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: VerifySessionParams) =>
      apiPost<VerifySessionResult>("/api/stripe/verify-session", {
        sessionId: params.sessionId,
      }, "Erreur de vérification"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
}
