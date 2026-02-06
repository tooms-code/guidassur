"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  Lock,
  Unlock,
  BarChart3,
  Settings,
  FileText,
  Filter,
  Trash2,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/frontend/hooks/useAuth";
import { useUserAnalyses, useUserDrafts, useDeleteDraft } from "@/frontend/queries/user";
import { InsuranceType } from "@/shared/types/insurance";
import { AnalysisSortField, SortOrder } from "@/backend/domain/interfaces/IUserService";
import { Button } from "@/frontend/components/ui/button";
import { Pagination } from "@/frontend/components/ui/Pagination";
import { insuranceIcons, insuranceLabels } from "@/frontend/constants/insurance";
import { getScoreColor, formatDate, formatTimeAgo } from "@/frontend/lib/format";
import { useVerifyStripeSession } from "@/frontend/queries/checkout";

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [creditAnimation, setCreditAnimation] = useState<number | null>(null);
  const verifySession = useVerifyStripeSession();
  const verificationTriggered = useRef(false);

  // Handle payment success redirect - verify with Stripe
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    const credits = searchParams.get("credits");

    if (payment === "success" && sessionId && !verificationTriggered.current) {
      verificationTriggered.current = true;

      // Clean URL immediately
      window.history.replaceState({}, "", "/compte");

      // Verify payment with Stripe (this adds credits if webhook hasn't yet)
      verifySession.mutate(
        { sessionId },
        {
          onSuccess: (result) => {
            if (result.success) {
              // Trigger credit animation
              const creditCount = result.credits || (credits ? parseInt(credits, 10) : 0);
              if (creditCount > 0) {
                setCreditAnimation(creditCount);
                setTimeout(() => setCreditAnimation(null), 2000);
              }
            }
          },
        }
      );
    }
  }, [searchParams, verifySession]);

  const [filterType, setFilterType] = useState<InsuranceType | "all">("all");
  const [filterUnlocked, setFilterUnlocked] = useState<boolean | "all">("all");
  const [sortBy, setSortBy] = useState<AnalysisSortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);

  const { data, isLoading } = useUserAnalyses({
    insuranceType: filterType === "all" ? undefined : filterType,
    isUnlocked: filterUnlocked === "all" ? undefined : filterUnlocked,
    sortBy,
    sortOrder,
    limit,
    offset,
  });

  const { data: draftsData } = useUserDrafts();
  const deleteDraft = useDeleteDraft();

  const handleDeleteDraft = (e: React.MouseEvent, draftId: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteDraft.mutate(draftId);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Bonjour, {user?.fullName?.split(" ")[0] || ""}
            </h1>
            <p className="text-gray-500 mt-1">
              Retrouvez toutes vos analyses d&apos;assurance
            </p>
          </div>
          <div className="relative">
            <motion.div
              key={user?.credits}
              initial={creditAnimation ? { scale: 1.2 } : false}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="px-4 py-2 bg-emerald-50 rounded-lg"
            >
              <span className="text-sm text-emerald-700 font-medium">
                {user?.credits || 0} crédit{(user?.credits || 0) !== 1 ? "s" : ""}
              </span>
            </motion.div>
            <AnimatePresence>
              {creditAnimation && (
                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -30 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute -top-2 left-1/2 -translate-x-1/2 text-emerald-500 font-bold text-lg"
                >
                  +{creditAnimation}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link
            href="/compte/stats"
            className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-emerald-500 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                Statistiques
              </p>
              <p className="text-sm text-gray-500">Voir mes économies</p>
            </div>
          </Link>

          <Link
            href="/compte/paiements"
            className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-emerald-500 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                Paiements
              </p>
              <p className="text-sm text-gray-500">Historique & crédits</p>
            </div>
          </Link>

          <Link
            href="/compte/parametres"
            className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-emerald-500 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <Settings className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                Paramètres
              </p>
              <p className="text-sm text-gray-500">Sécurité & compte</p>
            </div>
          </Link>
        </div>

        {/* In Progress Drafts */}
        {draftsData && draftsData.drafts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              En cours ({draftsData.drafts.length})
            </h2>
            <div className="space-y-3">
              {draftsData.drafts.map((draft, index) => {
                const Icon = insuranceIcons[draft.type as InsuranceType];
                const timeAgo = formatTimeAgo(draft.updatedAt);
                return (
                  <motion.div
                    key={draft.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/questionnaire/resume/${draft.id}`}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-400 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">
                            {insuranceLabels[draft.type as InsuranceType]}
                          </p>
                          <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            En cours
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {draft.answersCount} question{draft.answersCount !== 1 ? "s" : ""} répondue{draft.answersCount !== 1 ? "s" : ""} · {timeAgo}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteDraft(e, draft.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Filtrer :</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["all", InsuranceType.AUTO, InsuranceType.HABITATION, InsuranceType.GAV, InsuranceType.MUTUELLE] as const).map((type) => (
              <button
                key={type}
                onClick={() => { setFilterType(type); setOffset(0); }}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  filterType === type
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {type === "all" ? "Tous" : insuranceLabels[type]}
              </button>
            ))}
          </div>

          <div className="hidden md:block w-px h-6 bg-gray-200" />

          <div className="flex items-center gap-2">
            {[
              { value: "all", label: "Tous" },
              { value: "unlocked", label: "Débloqués" },
              { value: "locked", label: "Verrouillés" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  if (item.value === "all") setFilterUnlocked("all");
                  else setFilterUnlocked(item.value === "unlocked");
                  setOffset(0);
                }}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  (filterUnlocked === "all" && item.value === "all") ||
                  (filterUnlocked === true && item.value === "unlocked") ||
                  (filterUnlocked === false && item.value === "locked")
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-sm text-gray-500">Trier par :</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-") as [AnalysisSortField, SortOrder];
              setSortBy(field);
              setSortOrder(order);
              setOffset(0);
            }}
            className="text-sm text-gray-900 bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="date-desc">Plus récent</option>
            <option value="date-asc">Plus ancien</option>
            <option value="score-desc">Meilleur score</option>
            <option value="score-asc">Score à améliorer</option>
          </select>
        </div>

        {/* Analyses List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Mes analyses ({data?.total || 0})
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-6">Aucune analyse trouvée</p>
              <Link href="/">
                <Button>Faire ma première analyse</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.data.map((analysis, index) => {
                const Icon = insuranceIcons[analysis.insuranceType];
                return (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/resultat/${analysis.id}`}
                      className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-emerald-500 transition-colors group"
                    >
                      <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-emerald-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 truncate">
                            {analysis.insuranceLabel}
                          </p>
                          {analysis.isUnlocked ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <Unlock className="w-3 h-3" />
                              Débloqué
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              <Lock className="w-3 h-3" />
                              Verrouillé
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(analysis.createdAt)} · {analysis.insightsCount} recommandations
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className={`text-2xl font-semibold ${getScoreColor(analysis.score)}`}>
                          {analysis.score}
                        </p>
                        <p className="text-xs text-gray-500">{analysis.scoreLabel}</p>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                    </Link>
                  </motion.div>
                );
              })}
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
        </div>
      </div>
    </div>
  );
}
