"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/frontend/components/ui/button";

const COOKIE_CONSENT_KEY = "guidassur_cookie_consent";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay before showing the banner
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowBanner(false);
  };

  const handleRefuse = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "refused");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 shadow-lg">
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Nous utilisons des cookies pour améliorer votre expérience sur notre site.
                  En continuant, vous acceptez notre{" "}
                  <a href="/politique-confidentialite" className="text-emerald-600 hover:text-emerald-700 underline">
                    politique de confidentialité
                  </a>.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleRefuse}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Refuser
                </button>
                <Button size="sm" onClick={handleAccept}>
                  Accepter
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
