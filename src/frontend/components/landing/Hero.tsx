"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { InsuranceType } from "@/shared/types/insurance";
import { ArrowRight, ChevronRight } from "lucide-react";
import { insuranceTypes } from "@/frontend/constants/insurance";

const rotatingWords = ["y voir clair", "décrypter", "décider"];

export function Hero() {
  const router = useRouter();
  const [price, setPrice] = useState("");
  const [step, setStep] = useState<"price" | "type">("price");
  const [selectedType, setSelectedType] = useState<InsuranceType | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handlePriceSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (price && parseFloat(price) > 0) {
      setStep("type");
    }
  };

  const handleTypeSelect = (type: InsuranceType) => {
    setSelectedType(type);
    router.push(`/questionnaire?price=${encodeURIComponent(price)}&type=${type}`);
  };

  const handleBack = () => {
    setStep("price");
    setSelectedType(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <section className="pt-12 pb-8 md:pt-16 md:pb-10">
      <div className="max-w-4xl mx-auto px-6">
        {/* Main content */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-semibold text-gray-900 leading-[1.15] tracking-tight">
            Comprenez-vous vraiment
            <br />
            votre assurance ?
          </h1>

          <div className="mt-4 h-10 sm:h-12 flex items-center justify-center">
            <span className="text-lg sm:text-xl text-gray-500">
              On vous aide à{" "}
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="inline-block ml-1.5 text-lg sm:text-xl font-bold text-emerald-500"
              >
                {rotatingWords[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </div>

          <h2 className="mt-4 text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Analysez votre contrat en quelques clics.
            Découvrez ce qui vous couvre vraiment, ce qui manque, et prenez des décisions éclairées.
          </h2>

          {/* CTA Section */}
          <div className="mt-8">
            <AnimatePresence mode="wait">
              {step === "price" ? (
                <motion.form
                  key="price-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handlePriceSubmit}
                  className="max-w-md mx-auto"
                >
                  <div className="space-y-4">
                    <div className="relative w-full">
                      <input
                          ref={inputRef}
                          type="text"
                          inputMode="numeric"
                          value={price}
                          onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                          className="w-full text-center text-2xl font-semibold py-4 px-4 border rounded-xl bg-white focus:outline-none focus:border-emerald-500 border-gray-200 transition-colors duration-150"
                          autoFocus
                      />
                      {!price && (
                          <span className="absolute inset-0 flex items-center justify-center text-base font-normal text-gray-400 pointer-events-none">
                            Et vous, c'est combien par an ?
                          </span>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={!price || parseFloat(price) <= 0}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                    >
                      C'est parti
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-center text-sm text-gray-400">
                      Gratuit • Sans engagement • Résultats en 30 secondes
                    </p>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="type-selection"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-lg mx-auto"
                >
                  {/* Price display with back button */}
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors group"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="font-medium text-emerald-500">{price} €</span>
                    <span>— modifier</span>
                  </button>

                  <p className="text-gray-600 mb-5 font-medium">
                    Quel type de contrat ?
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {insuranceTypes.map(({ type, label, icon: Icon }, index) => (
                      <motion.button
                        key={type}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        onClick={() => handleTypeSelect(type)}
                        className={`group relative flex items-center gap-3 p-4 bg-white rounded-xl border transition-all duration-200 ${
                          selectedType === type
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:border-emerald-300"
                        }`}
                      >
                        <div className={`p-2 rounded-lg transition-colors ${
                          selectedType === type
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-900">{label}</span>
                        <ArrowRight className={`w-4 h-4 ml-auto transition-all ${
                          selectedType === type
                            ? "text-emerald-500 translate-x-0 opacity-100"
                            : "text-gray-300 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }`} />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
