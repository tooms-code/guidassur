"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Lock,
  Check,
  Save,
  Loader2,
} from "lucide-react";
import { AnalysisPublicDto, InsightDto } from "@/backend/application/dtos/analysis.dto";
import { getScoreColor, getScoreCardColor } from "@/frontend/lib/format";
import { useUnlockPrice } from "@/frontend/queries/pricing";

interface AnalysisResultsProps {
  analysis: AnalysisPublicDto;
  isAuthenticated?: boolean;
  userCredits?: number;
  onUnlockWithCredit?: () => void;
  onUnlockWithPayment?: () => void;
  isUnlocking?: boolean;
  isSaved?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "OK":
      return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    case "ATTENTION":
      return <AlertCircle className="w-5 h-5 text-amber-600" />;
    case "DANGER":
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    default:
      return null;
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "OK":
      return {
        card: "bg-emerald-50/80 border-emerald-200/60",
        savings: "text-emerald-700 bg-emerald-100/80",
      };
    case "ATTENTION":
      return {
        card: "bg-amber-50/80 border-amber-200/60",
        savings: "text-amber-700 bg-amber-100/80",
      };
    case "DANGER":
      return {
        card: "bg-red-50/80 border-red-200/60",
        savings: "text-red-700 bg-red-100/80",
      };
    default:
      return {
        card: "bg-gray-50 border-gray-200",
        savings: "text-gray-700 bg-gray-100",
      };
  }
}

function InsightCard({ insight, index }: { insight: InsightDto; index: number }) {
  const styles = getStatusStyles(insight.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4 }}
      className={`p-5 rounded-2xl border ${styles.card}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon(insight.status)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1.5">{insight.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{insight.description}</p>
          {insight.fullDescription && (
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{insight.fullDescription}</p>
          )}
          {insight.savingsMin != null && insight.savingsMax != null && (
            <div className={`mt-4 inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-lg ${styles.savings}`}>
              Économie : {insight.savingsMin}€ - {insight.savingsMax}€/an
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4 }}
      className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 relative overflow-hidden"
    >
      <div className="flex items-start gap-4 opacity-40 blur-[3px]">
        <div className="w-5 h-5 rounded-full bg-gray-300" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 bg-gray-300 rounded-lg w-3/4" />
          <div className="h-3 bg-gray-200 rounded-lg w-full" />
          <div className="h-3 bg-gray-200 rounded-lg w-2/3" />
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 font-medium bg-white px-4 py-2 rounded-full border border-gray-200">
          <Lock className="w-4 h-4" />
          <span>Recommandation verrouillée</span>
        </div>
      </div>
    </motion.div>
  );
}

export function AnalysisResults({
  analysis,
  isAuthenticated = false,
  userCredits = 0,
  onUnlockWithCredit,
  onUnlockWithPayment,
  isUnlocking = false,
  isSaved = false,
  onSave,
  isSaving = false,
}: AnalysisResultsProps) {
  const hasCredits = userCredits > 0;
  const { display: unlockPrice, isLoading: isPriceLoading } = useUnlockPrice();

  const handleUnlock = () => {
    // If not authenticated, redirect to login first
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/resultat/${analysis.id}&action=unlock`;
      return;
    }

    // If user has credits, use the credit unlock flow
    if (hasCredits && onUnlockWithCredit) {
      onUnlockWithCredit();
      return;
    }

    // Otherwise, trigger Stripe checkout
    if (onUnlockWithPayment) {
      onUnlockWithPayment();
    }
  };

  const isLoading = isUnlocking;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-3xl p-8 mb-6 border ${getScoreCardColor(analysis.score)}`}
        >
          <div className="text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4"
            >
              Résultat de ton analyse
            </motion.p>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.3, duration: 0.6 }}
              className={`text-7xl font-bold mb-3 ${getScoreColor(analysis.score)}`}
            >
              {analysis.score}
              <span className="text-4xl font-semibold text-gray-400">/100</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl font-semibold text-gray-800"
            >
              {analysis.scoreLabel}
            </motion.p>

            {analysis.potentialSavingsMax > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-5 inline-flex items-center text-sm text-gray-600 border border-gray-200 bg-white/80 px-4 py-2 rounded-full"
              >
                <span>Économie potentielle : <strong className="text-gray-800">{analysis.potentialSavingsMin}€ - {analysis.potentialSavingsMax}€</strong>/an</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Save Button - Compact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          {!isAuthenticated ? (
            <Link
              href={`/login?redirect=/resultat/${analysis.id}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <Save className="w-4 h-4" />
              Sauvegarder cette analyse
            </Link>
          ) : !isSaved ? (
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder cette analyse
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium">
              <Check className="w-4 h-4" />
              Analyse sauvegardée
            </div>
          )}
        </motion.div>

        {/* Recommendations Section */}
        {analysis.insights.length > 0 && (
          <section className="mb-8">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg font-semibold text-gray-900 mb-4"
            >
              {analysis.isUnlocked ? "Toutes les recommandations" : "Points identifiés"}
            </motion.h2>
            <div className="space-y-3">
              {analysis.insights.map((insight, index) => (
                <InsightCard key={insight.id} insight={insight} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Locked Recommendations */}
        {!analysis.isUnlocked && analysis.lockedCount > 0 && (
          <section className="mb-8">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg font-semibold text-gray-900 mb-4"
            >
              {analysis.lockedCount} recommandation{analysis.lockedCount > 1 ? "s" : ""} supplémentaire{analysis.lockedCount > 1 ? "s" : ""}
            </motion.h2>
            <div className="space-y-3">
              {Array.from({ length: Math.min(analysis.lockedCount, 3) }).map((_, index) => (
                <LockedInsightCard key={index} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Premium Unlock CTA */}
        {!analysis.isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-3">
                Débloquer l&apos;analyse complète
              </h2>

              <p className="text-emerald-100 mb-5 text-sm leading-relaxed">
                Accède à toutes les recommandations personnalisées pour optimiser ton contrat.
              </p>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {[
                  `${analysis.lockedCount} recommandations détaillées supplémentaires`,
                  "Analyse approfondie",
                  "Plan d'action concret",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/90">
                    <Check className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-5">
                {isPriceLoading ? (
                  <div className="h-9 w-24 bg-white/20 rounded animate-pulse" />
                ) : unlockPrice ? (
                  <span className="text-3xl font-bold">
                    {unlockPrice.amount.toFixed(2)}€
                  </span>
                ) : (
                  <span className="text-3xl font-bold">4,99€</span>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={handleUnlock}
                disabled={isLoading}
                className="w-full py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Déblocage...
                  </>
                ) : isAuthenticated && hasCredits ? (
                  "Utiliser 1 crédit"
                ) : (
                  "Débloquer maintenant"
                )}
              </button>

              {/* Credits info */}
              {isAuthenticated ? (
                <p className="mt-3 text-center text-sm text-emerald-200">
                  {userCredits} crédit{userCredits !== 1 ? "s" : ""} disponible{userCredits !== 1 ? "s" : ""}
                </p>
              ) : (
                <button
                  onClick={() => {
                    window.location.href = `/login?redirect=/resultat/${analysis.id}&action=use_credit`;
                  }}
                  className="w-full mt-3 py-2 text-sm text-emerald-200 hover:text-white transition-colors"
                >
                  J&apos;ai déjà des crédits
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Unlocked Success State - Subtle indicator */}
        {analysis.isUnlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 py-3 text-sm text-gray-500"
          >
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Analyse complète débloquée</span>
          </motion.div>
        )}

        {/* Stripe notice */}
        {!analysis.isUnlocked && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs text-gray-400 mt-6"
          >
            Paiement sécurisé par Stripe
          </motion.p>
        )}

        {/* New Analysis Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-10 text-center"
        >
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
          >
            Analyser un autre contrat
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
