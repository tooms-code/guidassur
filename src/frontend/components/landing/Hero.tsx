"use client";

import { Button } from "@/frontend/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const insuranceTypes = ["auto", "habitation", "santé", "vie"];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insuranceTypes.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
          Comprenez votre contrat d&apos;assurance
        </h1>
        <div className="h-12 sm:h-14 md:h-16 flex items-center justify-center mt-2">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentIndex}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="text-3xl sm:text-4xl md:text-5xl font-semibold text-emerald-500"
            >
              {insuranceTypes[currentIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
          en 30 secondes
        </p>

        <p className="mt-8 md:mt-10 text-base md:text-lg text-gray-500 max-w-lg mx-auto leading-relaxed px-4">
          Renseignez les informations de votre contrat, nos algorithmes l&apos;analysent
          et vous disent ce qui est couvert — et ce qui ne l&apos;est pas.
        </p>

        <div className="mt-8 md:mt-10">
          <Link href="/questionnaire/auto">
            <Button size="lg" className="w-full sm:w-auto">Analyser gratuitement</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
