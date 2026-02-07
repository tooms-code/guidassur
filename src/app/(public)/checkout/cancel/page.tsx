"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Check, XCircle } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { useCreditPrices } from "@/frontend/queries/pricing";
import { useCreditsCheckout } from "@/frontend/queries/checkout";

function PaymentCancelledContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const priceId = searchParams.get("priceId");
  const { prices: creditPrices, isLoading } = useCreditPrices();
  const checkoutMutation = useCreditsCheckout();

  // Find the price that was being purchased
  const selectedPrice = creditPrices.find((p) => p.priceId === priceId);

  const handleRetry = () => {
    if (!priceId) {
      router.push("/#tarifs");
      return;
    }
    checkoutMutation.mutate({ priceId });
  };

  const benefits = [
    "Analyse détaillée de vos garanties",
    "Détection des exclusions importantes",
    "Recommandations personnalisées",
    "Comparaison avec le marché",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {/* Red X icon */}
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
            Paiement annulé
          </h1>
          <p className="text-gray-500 mb-8 text-center">
            Aucun montant n&apos;a été débité. Vous pouvez réessayer quand vous le souhaitez.
          </p>

          {/* Selected plan (if available) */}
          {selectedPrice && (
            <div className="mb-8 p-5 bg-white border border-gray-200 rounded-xl">
              <p className="text-sm text-gray-500 mb-3">
                Votre sélection
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedPrice.credits} crédit{selectedPrice.credits > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedPrice.credits} analyse{selectedPrice.credits > 1 ? "s" : ""} de contrat
                  </p>
                </div>
                <p className="text-xl font-semibold text-gray-900">
                  {selectedPrice.amount.toFixed(2).replace(".", ",")} €
                </p>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="mb-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-4">
              Ce que vous obtenez avec chaque crédit :
            </p>
            <ul className="space-y-2.5">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.08 }}
                  className="flex items-start gap-2.5"
                >
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm text-gray-600">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            <Button
              onClick={handleRetry}
              disabled={!priceId || checkoutMutation.isPending}
              className="w-full"
              size="lg"
            >
              {checkoutMutation.isPending ? "Redirection..." : "Réessayer le paiement"}
            </Button>
            <Link href="/#tarifs" className="block">
              <Button variant="secondary" className="w-full" size="lg">
                Voir tous les tarifs
              </Button>
            </Link>
          </motion.div>

          {/* Footer info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-center text-xs text-gray-400"
          >
            Paiements sécurisés par Stripe • Support :{" "}
            <a
              href="mailto:support@guidassur.fr"
              className="text-emerald-600 hover:text-emerald-700"
            >
              support@guidassur.fr
            </a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-gray-400 text-sm">Chargement...</div>
        </div>
      }
    >
      <PaymentCancelledContent />
    </Suspense>
  );
}
