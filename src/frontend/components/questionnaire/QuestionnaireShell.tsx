"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, Loader2 } from "lucide-react";
import { InsuranceType } from "@/shared/types/questionnaire";
import { useQuestionnaire } from "@/frontend/hooks/useQuestionnaire";
import { ProgressBar } from "./ProgressBar";
import { QuestionRenderer } from "./QuestionRenderer";
import { QuestionTip } from "./QuestionTip";

interface QuestionnaireShellProps {
  type: InsuranceType;
}

export function QuestionnaireShell({ type }: QuestionnaireShellProps) {
  const router = useRouter();
  const hasStarted = useRef(false);
  const isCompleting = useRef(false);
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
    reset,
  } = useQuestionnaire();

  // Start questionnaire on mount
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    reset();
    start(type);
  }, [type]);

  // Handle completion
  useEffect(() => {
    if (isComplete && !isCompleting.current) {
      isCompleting.current = true;
      complete().then((analysisId) => {
        router.push(`/resultat/${analysisId}`);
      });
    }
  }, [isComplete]);

  const handleAnswer = (answer: unknown) => {
    if (currentQuestion) {
      submitAnswer(currentQuestion.id, answer);
    }
  };

  const handleClose = () => {
    reset();
    router.push("/");
  };

  const canGoBack = progress && progress.current > 1;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={canGoBack ? goBack : undefined}
            disabled={!canGoBack || isLoading}
            className={`
              p-2 -ml-2 rounded-lg transition-colors
              ${canGoBack ? "hover:bg-gray-100 text-gray-600" : "text-gray-300"}
            `}
          >
            <ChevronLeft size={24} />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2">
            {progress && (
              <span className="text-sm font-medium text-gray-500">
                {progress.current} / {progress.total}
              </span>
            )}
          </div>

          <button
            onClick={handleClose}
            className="p-2 -mr-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {progress && <ProgressBar progress={progress} />}
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg">
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
              >
                {error}
                <button
                  onClick={() => start(type)}
                  className="block mt-2 text-red-600 underline"
                >
                  Réessayer
                </button>
              </motion.div>
            )}

            {/* Loading */}
            {isLoading && !currentQuestion && (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
              </div>
            )}

            {/* Question */}
            <AnimatePresence mode="wait">
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
                    />
                  </div>
                </motion.div>
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

        {/* Footer with session info */}
        {sessionId && (
          <div className="px-4 py-4 text-center">
            <p className="text-xs text-gray-400">
              Tes réponses sont sauvegardées automatiquement
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
