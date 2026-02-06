"use client";

import { motion, AnimatePresence } from "motion/react";
import { LogIn, LogOut, Save } from "lucide-react";

interface SaveDraftModalProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  isSaving: boolean;
  onClose: () => void;
  onQuit: () => void;
  onSave: () => void;
  onLoginToSave: () => void;
}

export function SaveDraftModal({
  isOpen,
  isAuthenticated,
  isSaving,
  onClose,
  onQuit,
  onSave,
  onLoginToSave,
}: SaveDraftModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quitter le questionnaire ?
            </h3>

            <p className="text-gray-600 mb-6">
              {isAuthenticated
                ? "Souhaitez-vous sauvegarder votre progression avant de quitter ?"
                : "Sans compte, vos réponses seront perdues. Créez un compte pour sauvegarder votre progression."
              }
            </p>

            <div className="space-y-3">
              <button
                onClick={isAuthenticated ? onSave : onLoginToSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium rounded-xl transition-colors"
              >
                {isAuthenticated ? <Save className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {isAuthenticated
                  ? (isSaving ? "Sauvegarde..." : "Sauvegarder")
                  : "Se connecter"
                }
              </button>
              <button
                onClick={onQuit}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Quitter sans sauvegarder
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
