"use client";

import { motion } from "motion/react";
import { Shield, FileSearch, Brain, CheckCircle } from "lucide-react";

const steps = [
  { icon: FileSearch, label: "Lecture de tes réponses", delay: 0 },
  { icon: Brain, label: "Analyse de ton contrat", delay: 1 },
  { icon: Shield, label: "Identification des points d'attention", delay: 2 },
  { icon: CheckCircle, label: "Génération des recommandations", delay: 2.5 },
];

export function AnalysisLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Animated logo/icon */}
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto rounded-full border-4 border-emerald-100 border-t-emerald-500"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Shield className="w-8 h-8 text-emerald-500" />
          </motion.div>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold text-gray-900 mb-2"
        >
          Analyse en cours
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-500 mb-10"
        >
          Notre algorithme analyse ton contrat pour identifier les optimisations possibles
        </motion.p>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay, duration: 0.4 }}
              className="flex items-center gap-3 text-left"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: step.delay + 0.2,
                  type: "spring",
                  stiffness: 300,
                }}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center"
              >
                <step.icon className="w-5 h-5 text-emerald-600" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: step.delay + 0.3 }}
                className="text-gray-700"
              >
                {step.label}
              </motion.span>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: step.delay + 0.5, type: "spring" }}
                className="ml-auto"
              >
                {index < steps.length - 1 ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
