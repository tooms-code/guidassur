"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, PiggyBank, FileText, Unlock, TrendingUp } from "lucide-react";
import { useUserStats } from "@/frontend/queries/user";
import { insuranceIcons } from "@/frontend/constants/insurance";
import { formatPriceRange } from "@/frontend/lib/format";
import { SpinnerPage } from "@/frontend/components/ui/Spinner";

export default function StatsPage() {
  const { data: stats, isLoading } = useUserStats();

  if (isLoading) {
    return <SpinnerPage />;
  }

  const savingsMin = stats?.totalPotentialSavingsMin || 0;
  const savingsMax = stats?.totalPotentialSavingsMax || 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        {/* Back link */}
        <Link
          href="/compte"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Retour au tableau de bord</span>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-gray-900">Mes statistiques</h1>
          <p className="text-gray-500 mt-1">Vue d&apos;ensemble de vos analyses et économies</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalAnalyses || 0}</p>
              <p className="text-xs text-gray-500">Analyses totales</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Unlock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{stats?.unlockedAnalyses || 0}</p>
              <p className="text-xs text-gray-500">Débloquées</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{stats?.averageScore || 0}/100</p>
              <p className="text-xs text-gray-500">Score moyen</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <PiggyBank className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">{formatPriceRange(savingsMin, savingsMax)}</p>
              <p className="text-xs text-gray-500">Économies /an</p>
            </div>
          </motion.div>
        </div>

        {/* Savings Highlight */}
        {savingsMax > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 bg-emerald-50 rounded-xl border border-emerald-100 mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <PiggyBank className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-emerald-800 font-medium mb-2">
                  Économies potentielles identifiées sur vos contrats
                </p>
                <p className="text-4xl font-semibold text-emerald-600">
                  {formatPriceRange(savingsMin, savingsMax)}
                  <span className="text-lg font-normal text-emerald-500 ml-2">/an</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Breakdown by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-white rounded-xl border border-gray-200 mb-12"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Répartition par type d&apos;assurance
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats?.analysesByType?.map((item, index) => {
              const Icon = insuranceIcons[item.type];
              return (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{item.count}</p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Score Evolution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 bg-white rounded-xl border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Évolution de votre score
          </h2>
          <div className="flex items-end justify-between gap-2 h-40">
            {stats?.scoreEvolution?.map((point, index) => {
              const height = `${(point.score / 100) * 100}%`;
              const month = new Date(point.date + "-01").toLocaleDateString("fr-FR", {
                month: "short",
              });

              return (
                <div key={point.date} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                    className="w-full bg-emerald-500 rounded-t-lg relative group cursor-default"
                    style={{ minHeight: "4px" }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {point.score}/100
                    </div>
                  </motion.div>
                  <span className="text-xs text-gray-500 capitalize">{month}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
