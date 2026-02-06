"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, Loader2, ArrowRight, LogIn, LogOut, Save } from "lucide-react";
import { InsuranceType } from "@/shared/types/insurance";
import { useQuestionnaire } from "@/frontend/hooks/useQuestionnaire";
import { useAuth } from "@/frontend/hooks/useAuth";
import { ProgressBar } from "@/frontend/components/questionnaire/ProgressBar";
import { QuestionRenderer } from "@/frontend/components/questionnaire/QuestionRenderer";
import { QuestionTip } from "@/frontend/components/questionnaire/QuestionTip";
import { insuranceTypes } from "@/frontend/constants/insurance";
import { ErrorMessage } from "@/frontend/components/ui/ErrorMessage";

type FlowStep = "price" | "type" | "questions";

function QuestionnaireContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const isCompleting = useRef(false);

  // Auth state
  const { user } = useAuth();

  // Flow state
  const [flowStep, setFlowStep] = useState<FlowStep>("price");
  const [price, setPrice] = useState("");
  const [selectedType, setSelectedType] = useState<InsuranceType | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  const {
    sessionId,
    currentQuestion,
    progress,
    isLoading,
    isSubmitting,
    isComplete,
    error,
    start,
    submitAnswer,
    goBack,
    complete,
    saveDraft,
    reset,
    abandon,
  } = useQuestionnaire();

  // Initialize from URL params (coming from landing page)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const urlPrice = searchParams.get("price");
    const urlType = searchParams.get("type") as InsuranceType | null;

    if (urlPrice && urlType && insuranceTypes.some(t => t.type === urlType)) {
      // Coming from landing with price and type already set
      setPrice(urlPrice);
      setSelectedType(urlType);
      setFlowStep("questions");
      // Store price for later use
      sessionStorage.setItem("guidassur_initial_price", urlPrice);
      // Start questionnaire
      reset();
      start(urlType, parseFloat(urlPrice));
    } else {
      // Fresh start - focus on price input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchParams, reset, start]);


  // Handle completion
  useEffect(() => {
    if (isComplete && !isCompleting.current) {
      isCompleting.current = true;
      complete().then((analysisId) => {
        router.push(`/resultat/${analysisId}`);
      });
    }
  }, [isComplete, complete, router]);

  const handlePriceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (price && parseFloat(price) > 0) {
      sessionStorage.setItem("guidassur_initial_price", price);
      setFlowStep("type");
    }
  };

  const handleTypeSelect = (type: InsuranceType) => {
    setSelectedType(type);
    setFlowStep("questions");
    reset();
    start(type, parseFloat(price) || undefined);
  };

  const handleAnswer = (answer: unknown) => {
    if (currentQuestion) {
      submitAnswer(currentQuestion.id, answer);
    }
  };

  const handleBack = () => {
    if (flowStep === "type") {
      setFlowStep("price");
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (flowStep === "questions") {
      if (progress && progress.current > 1) {
        goBack();
      } else {
        // Go back to type selection
        setFlowStep("type");
        reset();
      }
    }
  };

  const handleClose = () => {
    // If user hasn't started answering questions, just close
    if (flowStep === "price" || (flowStep === "type" && !sessionId)) {
      reset();
      router.push("/");
      return;
    }
    // Otherwise show exit modal
    setShowExitModal(true);
  };

  const handleExitWithoutSaving = async () => {
    setShowExitModal(false);
    await abandon();
    router.push("/");
  };

  const handleExitWithSave = async () => {
    if (user && sessionId) {
      await saveDraft();
    }
    setShowExitModal(false);
    reset();
    router.push(user ? "/compte" : "/");
  };

  const handleExitCancel = () => {
    setShowExitModal(false);
  };

  const handleExitWithAccount = () => {
    // Store current session info for resuming after login
    if (sessionId) {
      sessionStorage.setItem("guidassur_pending_session", sessionId);
    }
    setShowExitModal(false);
    router.push("/login?redirect=/questionnaire/resume");
  };

  const canGoBack = flowStep === "type" || flowStep === "questions";

  // Calculate total progress including price and type steps
  const getTotalProgress = () => {
    const baseTotal = (progress?.total || 5) + 2;
    if (flowStep === "price") {
      return { current: 1, total: baseTotal, percent: (1 / baseTotal) * 100, stepLabel: "Pour commencer" };
    }
    if (flowStep === "type") {
      return { current: 2, total: baseTotal, percent: (2 / baseTotal) * 100, stepLabel: "Juste avant de démarrer" };
    }
    if (progress) {
      const current = progress.current + 2;
      const total = progress.total + 2;
      return { current, total, percent: (current / total) * 100, stepLabel: progress.stepLabel };
    }
    return { current: 3, total: 7, percent: (3 / 7) * 100, stepLabel: "C'est parti" };
  };

  const totalProgress = getTotalProgress();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={canGoBack ? handleBack : undefined}
            disabled={!canGoBack || isLoading}
            className={`
              p-2 -ml-2 rounded-lg transition-colors
              ${canGoBack ? "hover:bg-gray-100 text-gray-600" : "text-gray-300"}
            `}
          >
            <ChevronLeft size={24} />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2">
            <span className="text-sm font-medium text-gray-500">
              {totalProgress.current} / {totalProgress.total}
            </span>
          </div>

          <button
            onClick={handleClose}
            className="p-2 -mr-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <ProgressBar progress={totalProgress} />
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg">
            {/* Global errors (non-validation errors) - kept for critical errors only */}

            <AnimatePresence mode="wait">
              {/* Step 1: Price */}
              {flowStep === "price" && (
                <motion.div
                  key="price-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm font-medium text-emerald-500 mb-2">
                    Pour commencer
                  </p>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                    Combien payez-vous par an ?
                  </h1>

                  <form onSubmit={handlePriceSubmit} className="space-y-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 font-medium">
                        €
                      </span>
                      <input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        value={price}
                        onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="850"
                        className="w-full text-center text-2xl font-semibold py-4 pl-10 pr-4 border rounded-xl bg-white focus:outline-none focus:border-emerald-500 border-gray-200 transition-colors duration-150"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!price || parseFloat(price) <= 0}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                    >
                      Continuer
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Type */}
              {flowStep === "type" && (
                <motion.div
                  key="type-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm font-medium text-emerald-500 mb-2">
                    Juste avant de démarrer
                  </p>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                    Quel type de contrat ?
                  </h1>

                  <div className="grid grid-cols-1 gap-3">
                    {insuranceTypes.map(({ type, label, icon: Icon }) => (
                      <button
                        key={type}
                        onClick={() => handleTypeSelect(type)}
                        className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-500 transition-all duration-200"
                      >
                        <div className="p-3 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-900">{label}</span>
                        <ArrowRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3+: Questions */}
              {flowStep === "questions" && (
                <>
                  {/* Loading */}
                  {isLoading && !currentQuestion && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center py-20"
                    >
                      <Loader2 size={32} className="animate-spin text-emerald-500" />
                    </motion.div>
                  )}

                  {/* Question */}
                  {currentQuestion && (
                    <motion.div
                      key={currentQuestion.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Step label */}
                      {progress && (
                        <p className="text-sm font-medium text-emerald-600 mb-2">
                          {progress.stepLabel}
                        </p>
                      )}

                      {/* Question label */}
                      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                        {currentQuestion.label}
                      </h1>

                      {/* Tip */}
                      {currentQuestion.tip && (
                        <QuestionTip tip={currentQuestion.tip} />
                      )}

                      {/* Question input */}
                      <div className={currentQuestion.tip ? "mt-6" : ""}>
                        <QuestionRenderer
                          question={currentQuestion}
                          onAnswer={handleAnswer}
                          error={error}
                        />
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>

            {/* Loading overlay when submitting answer */}
            {isSubmitting && (
              <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-20">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 text-center">
          <p className="text-xs text-gray-400">
            {sessionId ? "Tes réponses sont sauvegardées automatiquement" : "Analyse gratuite • Sans engagement"}
          </p>
        </div>
      </main>

      {/* Exit Modal */}
      <AnimatePresence>
        {showExitModal && (
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
                {user
                  ? "Souhaitez-vous sauvegarder votre progression avant de quitter ?"
                  : "Sans compte, vos réponses seront perdues. Créez un compte pour sauvegarder votre progression."
                }
              </p>
              <div className="space-y-3">
                <button
                  onClick={user ? handleExitWithSave : handleExitWithAccount}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
                >
                  {user ? <Save className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  {user ? "Sauvegarder" : "Se connecter"}
                </button>
                <button
                  onClick={handleExitWithoutSaving}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Quitter sans sauvegarder
                </button>
                <button
                  onClick={handleExitCancel}
                  className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Loading fallback
function QuestionnaireLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 size={32} className="animate-spin text-emerald-500" />
    </div>
  );
}

// Main export with Suspense boundary
export default function QuestionnairePage() {
  return (
    <Suspense fallback={<QuestionnaireLoading />}>
      <QuestionnaireContent />
    </Suspense>
  );
}
