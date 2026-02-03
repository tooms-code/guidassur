"use client";

import { motion } from "motion/react";
import { ClipboardList, Cpu, FileCheck } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: ClipboardList,
    title: "Renseignez",
    description: "Entrez les informations de votre contrat",
  },
  {
    number: "2",
    icon: Cpu,
    title: "Analysez",
    description: "Nos algorithmes lisent chaque clause",
  },
  {
    number: "3",
    icon: FileCheck,
    title: "Comprenez",
    description: "Recevez un résumé clair et actionnable",
  },
];

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="py-16 md:py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold text-gray-900 text-center mb-12 md:mb-20"
        >
          Comment ça marche
        </motion.h2>

        <div className="relative">
          {/* Animated flow lines - desktop only */}
          <div className="hidden md:block">
            <div className="absolute top-8 left-[calc(16.66%+40px)] w-[calc(33.33%-60px)] h-0.5">
              <div className="absolute inset-0 border-t-2 border-dashed border-gray-300" />
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 bg-emerald-400 origin-left"
              />
            </div>
            <div className="absolute top-8 right-[calc(16.66%+40px)] w-[calc(33.33%-60px)] h-0.5">
              <div className="absolute inset-0 border-t-2 border-dashed border-gray-300" />
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 bg-emerald-400 origin-left"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-10 md:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.2 }}
                className="flex-1 flex flex-col items-center text-center relative z-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.4 + index * 0.2
                  }}
                  whileHover={{ scale: 1.05 }}
                  className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5 relative"
                >
                  <step.icon size={24} className="text-emerald-600" strokeWidth={1.5} />
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                      delay: 0.6 + index * 0.2
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center"
                  >
                    {step.number}
                  </motion.div>
                </motion.div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm max-w-[200px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
