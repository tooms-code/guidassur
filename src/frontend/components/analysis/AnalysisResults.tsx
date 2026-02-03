"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Lock,
  TrendingUp,
  Check,
  User,
  Zap,
} from "lucide-react";
import { FreeAnalysisResponseDto, InsightDto } from "@/backend/application/dtos/analysis.dto";

interface AnalysisResultsProps {
  analysis: FreeAnalysisResponseDto;
  unlockedInsights?: InsightDto[];
  isAuthenticated?: boolean;
  userCredits?: number;
  onUnlock?: () => void;
  isUnlocking?: boolean;
}

function getScoreColor(score: number) {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function getScoreBgColor(score: number) {
  if (score >= 75) return "bg-emerald-50 border-emerald-100";
  if (score >= 50) return "bg-amber-50 border-amber-100";
  return "bg-red-50 border-red-100";
}

function getStatusIcon(status: string) {
  switch (status) {
    case "OK":
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case "ATTENTION":
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    case "DANGER":
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    default:
      return null;
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case "OK":
      return "bg-emerald-50 border-emerald-200";
    case "ATTENTION":
      return "bg-amber-50 border-amber-200";
    case "DANGER":
      return "bg-red-50 border-red-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
}

function InsightCard({ insight, index }: { insight: InsightDto; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-5 rounded-xl border ${getStatusBg(insight.status)}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon(insight.status)}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
          <p className="text-sm text-gray-600">{insight.description}</p>
          {insight.fullDescription && (
            <p className="text-sm text-gray-500 mt-2">{insight.fullDescription}</p>
          )}
          {insight.savingsMin && insight.savingsMax && (
            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span>
                Économie potentielle : {insight.savingsMin}€ - {insight.savingsMax}€/an
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function LockedInsightCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-5 rounded-xl border border-gray-200 bg-gray-50 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
      <div className="flex items-start gap-3 filter blur-[2px]">
        <div className="w-5 h-5 rounded-full bg-gray-300" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/60">
        <div className="flex items-center gap-2 text-gray-600 font-medium">
          <Lock className="w-4 h-4" />
          <span>Insight verrouillé</span>
        </div>
      </div>
    </motion.div>
  );
}

const creditPacks = [
  { credits: 1, price: 4.90, popular: false },
  { credits: 3, price: 9.90, popular: true, savings: "33%" },
  { credits: 5, price: 14.90, popular: false, savings: "40%" },
];

export function AnalysisResults({
  analysis,
  unlockedInsights,
  isAuthenticated = false,
  userCredits = 0,
  onUnlock,
  isUnlocking = false,
}: AnalysisResultsProps) {
  const [selectedPack, setSelectedPack] = useState(1);
  const [showCreditPacks, setShowCreditPacks] = useState(false);

  const isUnlocked = !!unlockedInsights && unlockedInsights.length > 0;

  const handleUnlock = () => {
    // TODO: Later, redirect to Stripe checkout
    // For now, directly unlock (simulating successful payment)
    if (onUnlock) {
      onUnlock();
    }
  };

  const handleBuyCredits = (credits: number, price: number) => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/resultat/${analysis.id}&action=buy&pack=${credits}`;
      return;
    }

    console.log("Buying credits:", credits, "for", price, "€");
    // TODO: Integrate Stripe checkout
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Save Notice */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {isAuthenticated ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <Check className="w-4 h-4" />
              <span>Analyse sauvegardée dans ton espace</span>
            </div>
          ) : (
            <Link
              href={`/login?redirect=/resultat/${analysis.id}`}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Connecte-toi pour sauvegarder ton analyse</span>
            </Link>
          )}
        </motion.div>

        {/* Score Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl p-8 mb-8 border ${getScoreBgColor(analysis.score)}`}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className={`w-8 h-8 ${getScoreColor(analysis.score)}`} />
              <h1 className="text-2xl font-semibold text-gray-900">
                Ton analyse
              </h1>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className={`text-6xl font-bold mb-2 ${getScoreColor(analysis.score)}`}
            >
              {analysis.score}
              <span className="text-3xl">/100</span>
            </motion.div>

            <p className="text-lg text-gray-700 font-medium mb-2">
              {analysis.scoreLabel}
            </p>

            {analysis.potentialSavingsMax > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 text-sm text-gray-600"
              >
                Économie potentielle : {analysis.potentialSavingsMin}€ - {analysis.potentialSavingsMax}€/an
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Free Insights */}
        {analysis.freeInsights.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Points identifiés
            </h2>
            <div className="space-y-4">
              {analysis.freeInsights.map((insight, index) => (
                <InsightCard key={insight.id} insight={insight} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Unlocked Insights (after payment/debug) */}
        {isUnlocked && unlockedInsights && unlockedInsights.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Insights débloqués
            </h2>
            <div className="space-y-4">
              {unlockedInsights.map((insight, index) => (
                <InsightCard key={insight.id} insight={insight} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Locked Insights (before payment) */}
        {!isUnlocked && analysis.lockedInsightsCount > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {analysis.lockedInsightsCount} insight{analysis.lockedInsightsCount > 1 ? "s" : ""} supplémentaire{analysis.lockedInsightsCount > 1 ? "s" : ""}
            </h2>
            <div className="space-y-4">
              {Array.from({ length: Math.min(analysis.lockedInsightsCount, 3) }).map((_, index) => (
                <LockedInsightCard key={index} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Premium Unlock CTA - Only show if not unlocked */}
        {!isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative overflow-hidden rounded-2xl border-2 border-emerald-500 bg-white"
          >
            {/* Promo Badge */}
            <div className="absolute top-0 right-0">
              <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                -50% LANCEMENT
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Débloquer l&apos;analyse complète
              </h2>

              <p className="text-gray-600 mb-4">
                Accède à tous les insights, recommandations personnalisées et économies détaillées.
              </p>

              {/* What's included */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{analysis.lockedInsightsCount} insights détaillés supplémentaires</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Recommandations personnalisées</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Plan d&apos;action pour économiser</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-gray-900">4,90€</span>
                <span className="text-lg text-gray-400 line-through">9,90€</span>
                <span className="text-sm text-gray-500">/ analyse</span>
              </div>

              {/* Main CTA */}
              <button
                onClick={handleUnlock}
                disabled={isUnlocking}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isUnlocking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Déblocage...
                  </>
                ) : (
                  "Débloquer pour 4,90€"
                )}
              </button>

              {/* Secondary - Already have credits */}
              <button
                onClick={() => {
                  window.location.href = `/login?redirect=/resultat/${analysis.id}&action=use_credit`;
                }}
                className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                J&apos;ai déjà des crédits
              </button>
            </div>

            {/* Credit Packs */}
            <AnimatePresence>
              {showCreditPacks && isAuthenticated && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-100 overflow-hidden"
                >
                  <div className="p-6 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                      Packs de crédits
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {creditPacks.map((pack) => (
                        <button
                          key={pack.credits}
                          onClick={() => setSelectedPack(pack.credits)}
                          className={`relative p-4 rounded-xl border-2 transition-all ${
                            selectedPack === pack.credits
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          {pack.popular && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                POPULAIRE
                              </span>
                            </div>
                          )}
                          <div className="text-2xl font-bold text-gray-900">
                            {pack.credits}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            crédit{pack.credits > 1 ? "s" : ""}
                          </div>
                          <div className="text-lg font-semibold text-emerald-600">
                            {pack.price.toFixed(2).replace(".", ",")}€
                          </div>
                          {pack.savings && (
                            <div className="text-xs text-emerald-600 font-medium mt-1">
                              -{pack.savings}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const pack = creditPacks.find(p => p.credits === selectedPack);
                        if (pack) handleBuyCredits(pack.credits, pack.price);
                      }}
                      className="w-full mt-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors"
                    >
                      Acheter {selectedPack} crédit{selectedPack > 1 ? "s" : ""} pour {creditPacks.find(p => p.credits === selectedPack)?.price.toFixed(2).replace(".", ",")}€
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Success message when unlocked */}
        {isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-6 text-center"
          >
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Analyse débloquée
            </h2>
            <p className="text-gray-600">
              Tu as accès à tous les insights et recommandations.
            </p>
          </motion.div>
        )}

        {/* Payment secure notice - only when not unlocked */}
        {!isUnlocked && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-xs text-gray-400 mt-4"
          >
            Paiement sécurisé par Stripe
          </motion.p>
        )}

        {/* New Analysis */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
          >
            Analyser un autre contrat
          </Link>
        </div>
      </main>
    </div>
  );
}
