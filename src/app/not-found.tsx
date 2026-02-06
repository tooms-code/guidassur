"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Home, Search, ArrowRight, Shield, FileText, Umbrella, Heart, Car } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/30 flex items-center justify-center px-4 overflow-hidden">
      <div className="text-center max-w-lg mx-auto relative">
        {/* Floating insurance-themed icons */}
        <motion.div
          animate={{ y: [-8, 8, -8], rotate: [-5, 5, -5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-8 -left-16 sm:-left-24"
        >
          <Shield className="w-10 h-10 text-emerald-300/40" strokeWidth={1.5} />
        </motion.div>

        <motion.div
          animate={{ y: [6, -6, 6], rotate: [3, -3, 3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute -top-4 -right-12 sm:-right-20"
        >
          <FileText className="w-8 h-8 text-gray-300/50" strokeWidth={1.5} />
        </motion.div>

        <motion.div
          animate={{ y: [-5, 5, -5], rotate: [-8, 8, -8] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 -left-20 sm:-left-28"
        >
          <Umbrella className="w-9 h-9 text-sky-300/40" strokeWidth={1.5} />
        </motion.div>

        <motion.div
          animate={{ y: [4, -4, 4], rotate: [5, -5, 5] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="absolute top-1/2 -right-16 sm:-right-24"
        >
          <Heart className="w-7 h-7 text-rose-300/40" strokeWidth={1.5} />
        </motion.div>

        <motion.div
          animate={{ y: [-6, 6, -6], rotate: [-4, 4, -4] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          className="absolute bottom-24 -left-14 sm:-left-20"
        >
          <Car className="w-8 h-8 text-amber-300/40" strokeWidth={1.5} />
        </motion.div>

        <motion.div
          animate={{ y: [5, -5, 5], rotate: [6, -6, 6] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute bottom-32 -right-12 sm:-right-18"
        >
          <Shield className="w-6 h-6 text-emerald-300/30" strokeWidth={1.5} />
        </motion.div>

        {/* Main 404 display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-8"
        >
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            <div className="inline-flex items-center justify-center">
              <span className="text-8xl sm:text-9xl font-bold text-gray-200">4</span>
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mx-2"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </motion.div>
              <span className="text-8xl sm:text-9xl font-bold text-gray-200">4</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
            Oups, page introuvable
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            On dirait que cette page a pris des vacances sans prévenir.
            <br className="hidden sm:block" />
            Pas de panique, on va vous ramener en lieu sûr.
          </p>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors duration-200"
          >
            <Home className="w-4 h-4" />
            Retour à l&apos;accueil
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/questionnaire"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-200 transition-colors duration-200"
          >
            Analyser mon assurance
          </Link>
        </motion.div>

        {/* Fun footer message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 text-sm text-gray-400"
        >
          Erreur 404 • Cette page n&apos;existe pas (encore ?)
        </motion.p>
      </div>
    </div>
  );
}
