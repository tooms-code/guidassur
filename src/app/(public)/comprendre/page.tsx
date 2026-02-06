"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  Percent,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Info,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { Button } from "@/frontend/components/ui/button";
import { Accordion } from "@/frontend/components/ui/Accordion";
import {
  COMPRENDRE_TABS,
  GARANTIES_INTRO,
  INSURANCE_ACCORDIONS,
  PITFALLS,
  VIGILANCE_POINTS,
  FRANCHISE_INTRO,
  FRANCHISE_TYPES,
  FRANCHISE_ADVICE,
  RENEGOTIATION_TIMING,
  NEGOTIATION_CHECKLIST,
  DISCLAIMER,
  CTA_CONTENT,
  type InsuranceGuarantee,
} from "@/frontend/constants/comprendre";

// Icon mapping for tabs
const tabIcons: Record<string, LucideIcon> = {
  garanties: Shield,
  pieges: AlertTriangle,
  franchises: Percent,
  renegocier: MessageSquare,
};

// Short labels for mobile
const tabShortLabels: Record<string, string> = {
  garanties: "Garanties",
  pieges: "Pièges",
  franchises: "Franchises",
  renegocier: "Négocier",
};

// Badge for guarantee importance
function ImportanceBadge({ importance }: { importance: InsuranceGuarantee["importance"] }) {
  const config = {
    essential: { label: "Essentiel", className: "bg-emerald-100 text-emerald-700" },
    recommended: { label: "Recommandé", className: "bg-blue-100 text-blue-700" },
    optional: { label: "Optionnel", className: "bg-gray-100 text-gray-600" },
  };

  const { label, className } = config[importance];

  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", className)}>
      {label}
    </span>
  );
}

// Guarantee list for accordion content
function GuaranteeList({ guarantees }: { guarantees: InsuranceGuarantee[] }) {
  return (
    <div className="space-y-3">
      {guarantees.map((g, idx) => (
        <motion.div
          key={g.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex gap-3 p-3 bg-white rounded-lg border border-gray-100"
        >
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900">{g.title}</span>
              <ImportanceBadge importance={g.importance} />
            </div>
            <p className="text-sm text-gray-500 mt-1">{g.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Tab 1: Garanties essentielles
function GarantiesTab() {
  const accordionItems = INSURANCE_ACCORDIONS.map((acc) => ({
    id: acc.id,
    title: acc.title,
    icon: acc.icon,
    color: acc.color,
    content: <GuaranteeList guarantees={acc.guarantees} />,
  }));

  return (
    <div className="space-y-8">
      {/* Intro card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <Shield className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{GARANTIES_INTRO.title}</h3>
            <p className="text-gray-600 mt-1">{GARANTIES_INTRO.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Accordion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Accordion items={accordionItems} />
      </motion.div>
    </div>
  );
}

// Tab 2: Pièges à éviter
function PiegesTab() {
  return (
    <div className="space-y-8">
      {/* À éviter - Warning card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">À éviter absolument</h3>
        </div>
        <div className="space-y-4">
          {PITFALLS.map((pitfall, idx) => (
            <motion.div
              key={pitfall.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex gap-3"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-sm font-semibold">
                {idx + 1}
              </span>
              <div>
                <p className="font-medium text-gray-900">{pitfall.title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{pitfall.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Points de vigilance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Points de vigilance</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {VIGILANCE_POINTS.map((point, idx) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">{point.term}</span>
                </div>
                <p className="text-sm text-gray-500">{point.definition}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

// Tab 3: Franchises
function FranchisesTab() {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{FRANCHISE_INTRO.title}</h3>
          <p className="text-gray-600">{FRANCHISE_INTRO.description}</p>
          <div className="mt-4 p-4 bg-white rounded-xl border border-gray-100">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Le principe :</span>{" "}
              {FRANCHISE_INTRO.relationship}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Types de franchise */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Les types de franchise</h3>
        <div className="space-y-3">
          {FRANCHISE_TYPES.map((type, idx) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
              className="p-4 bg-white rounded-xl border border-gray-200"
            >
              <p className="font-medium text-gray-900">{type.name}</p>
              <p className="text-sm text-gray-600 mt-1">{type.description}</p>
              <p className="text-xs text-gray-400 mt-2 italic">{type.example}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Conseils */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{FRANCHISE_ADVICE.title}</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {FRANCHISE_ADVICE.tips.map((tip) => {
            const Icon = tip.icon;
            return (
              <div
                key={tip.id}
                className="p-4 bg-white rounded-xl border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-gray-900">{tip.label}</span>
                </div>
                <p className="text-sm text-gray-500">{tip.description}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-sm text-emerald-800">
            <span className="font-semibold">Notre recommandation :</span>{" "}
            {FRANCHISE_ADVICE.recommendation}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Tab 4: Renégocier
function RenegocierTab() {
  return (
    <div className="space-y-8">
      {/* Quand renégocier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {RENEGOTIATION_TIMING.title}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {RENEGOTIATION_TIMING.situations.map((situation, idx) => {
            const Icon = situation.icon;
            return (
              <motion.div
                key={situation.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-gray-900">{situation.title}</span>
                </div>
                <p className="text-sm text-gray-500">{situation.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Checklist négociation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-5">
          Comment négocier efficacement ?
        </h3>
        <div className="space-y-4">
          {NEGOTIATION_CHECKLIST.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                className="flex gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{tip.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{tip.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

// Tab content mapping
const tabContent: Record<string, () => React.ReactElement> = {
  garanties: GarantiesTab,
  pieges: PiegesTab,
  franchises: FranchisesTab,
  renegocier: RenegocierTab,
};

export default function ComprendrePage() {
  const [activeTab, setActiveTab] = useState("garanties");

  const ActiveContent = tabContent[activeTab];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="pt-12 pb-8 md:pt-16 md:pb-10 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight"
          >
            Comprendre l'assurance
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-gray-500 text-lg"
          >
            Tout ce que tu dois savoir pour faire les bons choix
          </motion.p>
        </div>
      </section>

      {/* Tabs - Mobile: 2x2 grid, Desktop: horizontal */}
      <section className="sticky top-[73px] z-40 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          {/* Mobile: 2x2 Grid */}
          <nav className="grid grid-cols-4 gap-1.5 py-3 md:hidden">
            {COMPRENDRE_TABS.map((tab) => {
              const Icon = tabIcons[tab.id];
              const isActive = activeTab === tab.id;
              const shortLabel = tabShortLabels[tab.id];

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "relative flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-xs font-medium transition-all duration-200",
                    isActive
                      ? "text-emerald-700"
                      : "text-gray-400"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-gray-100 text-gray-400"
                    )}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  <span className="truncate max-w-full">{shortLabel}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabMobile"
                      className="absolute inset-0 bg-emerald-50 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Desktop: Horizontal tabs */}
          <nav className="hidden md:flex gap-1 py-3">
            {COMPRENDRE_TABS.map((tab) => {
              const Icon = tabIcons[tab.id];
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
                    isActive
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabDesktop"
                      className="absolute inset-0 bg-emerald-50 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-10">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ActiveContent />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-6 bg-emerald-50/50 border-t border-emerald-100">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex gap-3 items-start">
            <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-900 text-sm">{DISCLAIMER.title}</p>
              <p className="text-emerald-700 text-sm mt-1">{DISCLAIMER.content}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl"
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              {CTA_CONTENT.title}
            </h2>
            <p className="mt-3 text-emerald-100 max-w-md mx-auto">
              {CTA_CONTENT.description}
            </p>
            <Link href={CTA_CONTENT.buttonHref}>
              <Button
                size="lg"
                className="mt-6 bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {CTA_CONTENT.buttonText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
