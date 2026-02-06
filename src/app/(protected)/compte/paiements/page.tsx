"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  ChevronLeft,
  Receipt,
  CreditCard,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Pagination } from "@/frontend/components/ui/Pagination";
import { usePayments, PaymentDto } from "@/frontend/queries/payments";
import { useCreditsCheckout } from "@/frontend/queries/checkout";
import { formatDateTime } from "@/frontend/lib/format";
import { useCreditPrices } from "@/frontend/queries/pricing";

function getStatusStyle(status: PaymentDto["status"]) {
  switch (status) {
    case "Complété":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Échoué":
      return "bg-red-50 text-red-700 border-red-200";
    case "Remboursé":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

export default function PaymentsPage() {
  return (
    <Suspense>
      <PaymentsContent />
    </Suspense>
  );
}

function PaymentsContent() {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = usePayments({ status: statusFilter, limit, offset });
  const { prices: creditPrices, isLoading: pricesLoading } = useCreditPrices();
  const checkoutMutation = useCreditsCheckout();
  const [showRefundModal, setShowRefundModal] = useState<string | null>(null);
  const autoCheckoutTriggered = useRef(false);

  // Auto-trigger checkout if action=buy_credits after login
  useEffect(() => {
    const action = searchParams.get("action");
    const priceId = searchParams.get("priceId");

    if (
      action === "buy_credits" &&
      priceId &&
      !autoCheckoutTriggered.current &&
      !checkoutMutation.isPending
    ) {
      autoCheckoutTriggered.current = true;
      checkoutMutation.mutate({ priceId });
      window.history.replaceState({}, "", "/compte/paiements");
    }
  }, [searchParams, checkoutMutation]);

  const handleBuyCredits = (priceId: string) => {
    checkoutMutation.mutate({ priceId });
  };

  // Show loading while checkout is happening or prices are loading
  if (checkoutMutation.isPending || pricesLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {checkoutMutation.isPending ? "Redirection vers le paiement..." : "Chargement..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/compte"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour au compte
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            Mes paiements
          </h1>
          <p className="text-gray-500 mt-1">
            Historique de vos achats et transactions
          </p>
        </div>

        {/* Error Message */}
        {checkoutMutation.isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {checkoutMutation.error.message}
          </div>
        )}

        {/* Info Card - Moyens de paiement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">
                Moyens de paiement acceptés
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Tous les paiements sont sécurisés par Stripe. Nous acceptons :
              </p>
              <div className="flex flex-wrap gap-2">
                {["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay"].map(
                  (method) => (
                    <span
                      key={method}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg"
                    >
                      {method}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Acheter des crédits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 mb-8"
        >
          <h3 className="font-medium text-white mb-4">Acheter des crédits</h3>

          {creditPrices.length === 0 ? (
            <p className="text-white/70 text-sm">
              Les tarifs ne sont pas disponibles pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {creditPrices.map((price) => {
                const unitPrice = price.amount / price.credits;
                const oneCredit = creditPrices.find((p) => p.credits === 1);
                let savingsText: string | undefined;

                if (oneCredit && price.credits > 1) {
                  const savingsPercent = Math.round(
                    ((oneCredit.amount - unitPrice) / oneCredit.amount) * 100
                  );
                  if (savingsPercent > 0) {
                    savingsText = `Économie ${savingsPercent}%`;
                  }
                }

                return (
                  <button
                    key={price.priceId}
                    onClick={() => handleBuyCredits(price.priceId)}
                    disabled={checkoutMutation.isPending}
                    className="relative p-4 rounded-xl text-left transition-all bg-white/10 text-white hover:bg-white hover:text-gray-900 group disabled:opacity-50"
                  >
                    <p className="font-semibold">
                      {price.credits} crédit{price.credits > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-white/70 group-hover:text-gray-500">
                      {price.amount.toFixed(2).replace(".", ",")} €
                    </p>
                    {savingsText && (
                      <span className="text-xs font-medium text-emerald-300 group-hover:text-emerald-600">
                        {savingsText}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Mes transactions ({data?.total || 0})
          </h2>

          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { label: "Tous", value: undefined },
              { label: "Complétés", value: "completed" },
              { label: "En attente", value: "pending" },
              { label: "Échoués", value: "failed" },
              { label: "Remboursés", value: "refunded" },
            ].map((filter) => (
              <button
                key={filter.label}
                onClick={() => { setStatusFilter(filter.value); setOffset(0); }}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  statusFilter === filter.value
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-white rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Aucun paiement</p>
              <p className="text-sm text-gray-400">
                Vos transactions apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.data.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">
                          {payment.description}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${getStatusStyle(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(payment.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-gray-900">
                        {payment.amount}
                      </p>
                      {payment.canRefund && (
                        <button
                          onClick={() => setShowRefundModal(payment.id)}
                          className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                        >
                          Demander remboursement
                        </button>
                      )}
                    </div>
                  </div>

                  {payment.analysisId && (
                    <Link
                      href={`/resultat/${payment.analysisId}`}
                      className="inline-flex items-center gap-1 mt-3 text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      Voir l&apos;analyse
                      <ChevronLeft className="w-3 h-3 rotate-180" />
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {data && (
            <Pagination
              total={data.total}
              limit={data.limit}
              offset={data.offset}
              onPageChange={setOffset}
              onLimitChange={setLimit}
            />
          )}
        </motion.div>

        {/* Aide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-4 bg-gray-100 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">
                <strong>Une question sur un paiement ?</strong> Contactez-nous à{" "}
                <a
                  href="mailto:support@guidassur.fr"
                  className="text-emerald-600 hover:underline"
                >
                  support@guidassur.fr
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowRefundModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Demander un remboursement
            </h3>
            <p className="text-gray-600 mb-2">
              Un email pré-rempli avec votre référence de transaction sera ouvert dans votre messagerie.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Les remboursements sont traités sous 5-7 jours ouvrés selon votre banque.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowRefundModal(null)}
              >
                Annuler
              </Button>
              <a
                href={`mailto:support@guidassur.fr?subject=${encodeURIComponent(`Demande de remboursement — Réf. ${showRefundModal}`)}&body=${encodeURIComponent(`Bonjour,\n\nJe souhaite demander le remboursement de ma transaction.\n\nRéférence : ${showRefundModal}\n\nMerci de votre retour.\n\nCordialement`)}`}
                className="flex-1"
              >
                <Button className="w-full">Envoyer la demande</Button>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
