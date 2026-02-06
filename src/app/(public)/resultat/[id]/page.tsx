"use client";

import { Suspense, use, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { XCircle } from "lucide-react";
import { AnalysisResults } from "@/frontend/components/analysis/AnalysisResults";
import { AnalysisLoading } from "@/frontend/components/analysis/AnalysisLoading";
import { useAnalysis, useUnlockAnalysis, useSaveAnalysis, analysisKeys, clearAnalysisCache } from "@/frontend/queries/analysis";
import { useAuth } from "@/frontend/hooks/useAuth";
import { useCreditsCheckout, useVerifyStripeSession } from "@/frontend/queries/checkout";
import { useCreditPrices } from "@/frontend/queries/pricing";

interface PageProps {
  params: Promise<{ id: string }>;
}

function ResultatPageContent({ params }: PageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [showLoading, setShowLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const autoCheckoutTriggered = useRef(false);
  const paymentVerified = useRef(false);

  const { data: analysis, isLoading, error, refetch } = useAnalysis(id);
  const { user, isLoading: authLoading } = useAuth();
  const { prices: creditPrices, isLoading: pricesLoading } = useCreditPrices();
  const unlockMutation = useUnlockAnalysis();
  const saveMutation = useSaveAnalysis();
  const checkoutMutation = useCreditsCheckout();
  const verifySessionMutation = useVerifyStripeSession();

  // Get 1 credit price for unlock
  const oneCreditPrice = creditPrices.find((p) => p.credits === 1);

  // Handle payment success return from Stripe
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (paymentStatus === "success" && sessionId && !paymentVerified.current) {
      paymentVerified.current = true;
      setIsVerifyingPayment(true);

      // Clear stale cache so we fetch fresh data
      clearAnalysisCache(id);

      // Verify session (processes payment if webhook hasn't yet)
      verifySessionMutation.mutate(
        { sessionId },
        {
          onSettled: () => {
            // Invalidate and refetch to get the unlocked analysis
            queryClient.invalidateQueries({ queryKey: analysisKeys.detail(id) });
            refetch().finally(() => {
              setIsVerifyingPayment(false);
              // Clean URL
              window.history.replaceState({}, "", `/resultat/${id}`);
            });
          },
        }
      );
    }
  }, [searchParams, id, verifySessionMutation, queryClient, refetch]);

  // Simulate minimum loading time for animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Check if analysis is already saved (has userId matching current user)
  useEffect(() => {
    if (analysis && user && analysis.isSaved) {
      setIsSaved(true);
    }
  }, [analysis, user]);

  // Auto-trigger checkout if action=unlock and user just logged in
  useEffect(() => {
    const action = searchParams.get("action");

    // Only trigger once, when user is authenticated and action is unlock
    if (
      action === "unlock" &&
      !authLoading &&
      user &&
      analysis &&
      !analysis.isUnlocked &&
      !autoCheckoutTriggered.current &&
      !checkoutMutation.isPending &&
      !saveMutation.isPending
    ) {
      autoCheckoutTriggered.current = true;

      // Clean URL immediately
      window.history.replaceState({}, "", `/resultat/${id}`);

      // Step 1: Save the analysis to DB (persists it with the user's ID)
      // Step 2: Then proceed with checkout
      saveMutation.mutate(id, {
        onSuccess: () => {
          setIsSaved(true);
          if (user.credits > 0) {
            unlockMutation.mutate(id);
          } else if (oneCreditPrice) {
            checkoutMutation.mutate({
              priceId: oneCreditPrice.priceId,
              analysisId: id
            });
          }
        },
      });
    }
  }, [searchParams, authLoading, user, analysis, id, unlockMutation, checkoutMutation, saveMutation]);

  const handleCheckout = useCallback(() => {
    if (oneCreditPrice) {
      checkoutMutation.mutate({
        priceId: oneCreditPrice.priceId,
        analysisId: id
      });
    }
  }, [id, oneCreditPrice, checkoutMutation]);

  const handleUnlock = useCallback(async () => {
    try {
      await unlockMutation.mutateAsync(id);
    } catch (err) {
      console.error("Failed to unlock:", err);
    }
  }, [id, unlockMutation]);

  const handleSave = useCallback(async () => {
    try {
      const result = await saveMutation.mutateAsync(id);
      if (result.success || result.alreadySaved) {
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }
  }, [id, saveMutation]);

  // Show loading animation
  if (isLoading || showLoading || pricesLoading || checkoutMutation.isPending || isVerifyingPayment) {
    return <AnalysisLoading />;
  }

  // Show error
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Analyse introuvable
          </h1>
          <p className="text-gray-500 mb-6">
            Cette analyse n&apos;existe pas ou a expiré.
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Refaire une analyse
          </Link>
        </div>
      </div>
    );
  }

  // Show results
  if (!analysis) {
    return null;
  }

  return (
    <AnalysisResults
      analysis={analysis}
      isAuthenticated={!authLoading && !!user}
      userCredits={user?.credits ?? 0}
      onUnlockWithCredit={handleUnlock}
      onUnlockWithPayment={handleCheckout}
      isUnlocking={unlockMutation.isPending || checkoutMutation.isPending}
      isSaved={isSaved}
      onSave={handleSave}
      isSaving={saveMutation.isPending}
    />
  );
}

export default function ResultatPage({ params }: PageProps) {
  return (
    <Suspense fallback={<AnalysisLoading />}>
      <ResultatPageContent params={params} />
    </Suspense>
  );
}
