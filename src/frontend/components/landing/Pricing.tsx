"use client";

import { useMemo } from "react";
import { Button } from "@/frontend/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/frontend/lib/cn";
import { useAuth } from "@/frontend/hooks/useAuth";
import { useCreditsCheckout } from "@/frontend/queries/checkout";
import { useCreditPrices } from "@/frontend/queries/pricing";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  description: string;
  features: string[];
  cta: string;
  href?: string;
  popular?: boolean;
  priceId?: string; // Stripe price_id for checkout
  badge?: string; // Custom badge (calculated or from Stripe)
}

export function Pricing() {
  const router = useRouter();
  const { user } = useAuth();
  const checkoutMutation = useCreditsCheckout();
  const { prices: creditPrices, isLoading } = useCreditPrices();

  // Generate plans from Stripe data
  const plans: PricingPlan[] = useMemo(() => {
    const result: PricingPlan[] = [
      // Free plan (always first)
      {
        id: "free",
        name: "Découverte",
        price: 0,
        priceDisplay: "0€",
        description: "Pour tester le service",
        features: [
          "1 analyse de contrat",
          "Résumé des garanties",
          "Points d'attention",
        ],
        cta: "Commencer gratuitement",
        href: "/questionnaire",
      },
    ];

    // Add all credit prices from Stripe
    const oneCredit = creditPrices.find((p) => p.credits === 1);

    creditPrices.forEach((price) => {
      const { credits, amount, popular, priceId } = price;
      const unitPrice = amount / credits;
      const unitPriceDisplay = unitPrice.toFixed(2);

      // Calculate savings badge dynamically (for multi-credit packs)
      let savingsBadge: string | undefined;
      if (oneCredit && credits > 1) {
        const referencePrice = oneCredit.amount;
        const savingsPercent = Math.round(((referencePrice - unitPrice) / referencePrice) * 100);
        if (savingsPercent > 0) {
          savingsBadge = `Économie ${savingsPercent}%`;
        }
      }

      result.push({
        id: `pack_${credits}`,
        name: `${credits} crédit${credits > 1 ? 's' : ''}`,
        price: amount,
        priceDisplay: `${amount.toFixed(2).replace('.', ',')}€`,
        description: credits === 1 ? "Pour une analyse complète" : `Idéal pour ${credits > 3 ? 'plusieurs' : 'quelques'} contrats`,
        features: [
          `${credits} analyse${credits > 1 ? 's' : ''} complète${credits > 1 ? 's' : ''}`,
          ...(credits > 1 ? [`${unitPriceDisplay.replace('.', ',')}€ / analyse`] : []),
          "Détail des exclusions",
          "Recommandations personnalisées",
        ],
        cta: "Obtenir",
        priceId,
        popular,
        badge: savingsBadge,
      });
    });

    return result;
  }, [creditPrices]);

  const handlePurchase = (plan: PricingPlan) => {
    if (!plan.priceId) {
      // Free plan - just redirect
      if (plan.href) {
        router.push(plan.href);
      }
      return;
    }

    // Need to be logged in to buy credits
    if (!user) {
      // Redirect to login with action to trigger checkout after
      router.push(`/login?redirect=/compte/paiements&action=buy_credits&priceId=${plan.priceId}`);
      return;
    }

    // Trigger checkout mutation
    checkoutMutation.mutate({ priceId: plan.priceId });
  };

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

        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full md:w-80 h-96 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Mobile: stack with popular first */}
        {!isLoading && (
          <div className="flex flex-col md:hidden gap-6">
          {plans.map((plan, index) => {
            const isPopular = plan.popular;
            const displayBadge = isPopular ? "Populaire" : plan.badge;

            return (
              <motion.div
                key={plan.id}
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
                {displayBadge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    {displayBadge}
                  </div>
                )}

                <p className="text-sm font-medium text-gray-900 mb-1">
                  {plan.name}
                </p>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-semibold text-gray-900">
                    {plan.priceDisplay}
                  </span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        size={18}
                        className="text-emerald-500 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.href && !plan.priceId ? (
                  <Link href={plan.href} className="block">
                    <Button
                      variant={isPopular ? "primary" : "secondary"}
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant={isPopular ? "primary" : "secondary"}
                    className="w-full"
                    onClick={() => handlePurchase(plan)}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      plan.cta
                    )}
                  </Button>
                )}
              </motion.div>
            );
          })}
          </div>
        )}

        {/* Desktop: side by side */}
        {!isLoading && (
          <div className="hidden md:flex gap-6 items-end justify-center">
          {plans.map((plan, index) => {
            const isPopular = plan.popular;
            const displayBadge = isPopular ? "Populaire" : plan.badge;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "rounded-xl relative w-80 flex flex-col",
                  isPopular
                    ? "border-2 border-emerald-500 bg-white h-[420px] p-8"
                    : "border border-gray-200 bg-white h-[380px] p-8"
                )}
              >
                {displayBadge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    {displayBadge}
                  </div>
                )}

                <p className="text-sm font-medium text-gray-900 mb-1">
                  {plan.name}
                </p>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-semibold text-gray-900">
                    {plan.priceDisplay}
                  </span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        size={18}
                        className="text-emerald-500 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  {plan.href && !plan.priceId ? (
                    <Link href={plan.href} className="block">
                      <Button
                        variant={isPopular ? "primary" : "secondary"}
                        className="w-full"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant={isPopular ? "primary" : "secondary"}
                      className="w-full"
                      onClick={() => handlePurchase(plan)}
                      disabled={checkoutMutation.isPending}
                    >
                      {checkoutMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        plan.cta
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
          </div>
        )}
      </div>
    </section>
  );
}
