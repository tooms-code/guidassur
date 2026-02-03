"use client";

import { Button } from "@/frontend/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { PRICING } from "@/shared/constants";
import { motion } from "motion/react";
import { cn } from "@/shared/utils";

const planKeys = ["single", "free", "pack"] as const;

export function Pricing() {
  return (
    <section id="tarifs" className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold text-gray-900 text-center mb-4"
        >
          Tarifs
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-gray-500 text-center mb-12 md:mb-16 px-4"
        >
          Commencez gratuitement, payez uniquement ce dont vous avez besoin.
        </motion.p>

        {/* Mobile: stack with popular first */}
        <div className="flex flex-col md:hidden gap-6">
          {["free", "single", "pack"].map((key, index) => {
            const plan = PRICING[key];
            const isPopular = plan.popular;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "rounded-xl p-6 relative",
                  isPopular
                    ? "border-2 border-emerald-500 bg-white"
                    : "border border-gray-200 bg-white"
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Populaire
                  </div>
                )}

                <p className="text-sm font-medium text-gray-900 mb-1">
                  {plan.name}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-semibold text-gray-900">
                    {plan.price === 0 ? "0" : plan.price}€
                  </span>
                  {plan.price > 0 && key !== "pack" && (
                    <span className="text-gray-500 text-sm">/ analyse</span>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} className="block">
                  <Button
                    variant={isPopular ? "primary" : "secondary"}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Desktop: side by side */}
        <div className="hidden md:flex gap-6 items-end justify-center">
          {planKeys.map((key, index) => {
            const plan = PRICING[key];
            const isPopular = plan.popular;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "rounded-xl relative w-80 flex flex-col",
                  isPopular
                    ? "border-2 border-emerald-500 bg-white h-[480px] p-8"
                    : "border border-gray-200 bg-white h-[420px] p-8"
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Populaire
                  </div>
                )}

                <p className="text-sm font-medium text-gray-900 mb-1">
                  {plan.name}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-semibold text-gray-900">
                    {plan.price === 0 ? "0" : plan.price}€
                  </span>
                  {plan.price > 0 && key !== "pack" && (
                    <span className="text-gray-500 text-sm">/ analyse</span>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <Link href={plan.href} className="block">
                    <Button
                      variant={isPopular ? "primary" : "secondary"}
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
