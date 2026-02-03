"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ChevronRight,
  Car,
  Home,
  Heart,
  Shield,
  Lock,
  Unlock,
  BarChart3,
  Settings,
  FileText,
  Plus,
  Filter,
} from "lucide-react";
import { useAuth } from "@/frontend/hooks/useAuth";
import { useUserAnalyses } from "@/frontend/hooks/useUser";
import { InsuranceType } from "@/shared/types/insurance";
import { AnalysisSortField, SortOrder } from "@/backend/domain/interfaces/IUserService";
import { Button } from "@/frontend/components/ui/button";

const insuranceIcons: Record<InsuranceType, typeof Car> = {
  [InsuranceType.AUTO]: Car,
  [InsuranceType.HABITATION]: Home,
  [InsuranceType.GAV]: Shield,
  [InsuranceType.MUTUELLE]: Heart,
};

const typeLabels: Record<InsuranceType, string> = {
  [InsuranceType.AUTO]: "Auto",
  [InsuranceType.HABITATION]: "Habitation",
  [InsuranceType.GAV]: "GAV",
  [InsuranceType.MUTUELLE]: "Mutuelle",
};

function getScoreColor(score: number) {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-500";
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [filterType, setFilterType] = useState<InsuranceType | "all">("all");
  const [filterUnlocked, setFilterUnlocked] = useState<boolean | "all">("all");
  const [sortBy, setSortBy] = useState<AnalysisSortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const { data, isLoading } = useUserAnalyses({
    insuranceType: filterType === "all" ? undefined : filterType,
    isUnlocked: filterUnlocked === "all" ? undefined : filterUnlocked,
    sortBy,
    sortOrder,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
              Gérez vos analyses et paramètres
            </p>
          </div>
          <div className="px-4 py-2 bg-emerald-50 rounded-lg">
            <span className="text-sm text-emerald-700 font-medium">
              {user?.credits || 0} crédit{(user?.credits || 0) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link
            href="/compte/stats"
            className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-emerald-500 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
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
            href="/compte/parametres"
            className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-emerald-500 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                Paramètres
              </p>
              <p className="text-sm text-gray-500">Sécurité & compte</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-4 p-6 bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">Nouvelle analyse</p>
              <p className="text-sm text-emerald-100">Analyser un contrat</p>
            </div>
          </Link>
        </div>

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
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filterType === type
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type === "all" ? "Tous" : typeLabels[type]}
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
                }}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  (filterUnlocked === "all" && item.value === "all") ||
                  (filterUnlocked === true && item.value === "unlocked") ||
                  (filterUnlocked === false && item.value === "locked")
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
            }}
            className="text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
          ) : data?.analyses.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-6">Aucune analyse trouvée</p>
              <Link href="/">
                <Button>Faire ma première analyse</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.analyses.map((analysis, index) => {
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
                      <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
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
        </div>
      </div>
    </div>
  );
}
