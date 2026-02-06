"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useQuestionnaire } from "@/frontend/hooks/useQuestionnaire";
import { useAuth } from "@/frontend/hooks/useAuth";
import { ProgressBar } from "@/frontend/components/questionnaire/ProgressBar";
import { QuestionRenderer } from "@/frontend/components/questionnaire/QuestionRenderer";
import { QuestionTip } from "@/frontend/components/questionnaire/QuestionTip";
import { SaveDraftModal } from "@/frontend/components/questionnaire/SaveDraftModal";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft } from "lucide-react";

const PENDING_SESSION_KEY = "guidassur_pending_session";

function ResumeQuestionnaireContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasResumed = useRef(false);
  const isCompleting = useRef(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const { user, isLoading: authLoading } = useAuth();
  const isAuthenticated = !authLoading && !!user;

  const {
    sessionId,
    currentQuestion,
    progress,
    isLoading,
    isSubmitting,
    isComplete,
    error,
    submitAnswer,
    goBack,
    complete,
    saveDraft,
    resume,
    reset,
  } = useQuestionnaire();

  // Resume session on mount
  useEffect(() => {
    if (hasResumed.current || authLoading) return;

    // Get session ID from URL or sessionStorage
    const urlSessionId = searchParams.get("session");
    const storedSessionId = typeof window !== "undefined"
      ? sessionStorage.getItem(PENDING_SESSION_KEY)
      : null;

    const targetSessionId = urlSessionId || storedSessionId;

    if (!targetSessionId) {
      setResumeError("Aucune session à reprendre");
      return;
    }

    hasResumed.current = true;

    // Clear stored session
    if (storedSessionId) {
      sessionStorage.removeItem(PENDING_SESSION_KEY);
    }

    // Resume the session
    resume(targetSessionId).catch(() => {
      setResumeError("Session introuvable ou expirée");
    });
  }, [authLoading, searchParams, resume]);

  // Handle completion
  useEffect(() => {
    if (isComplete && !isCompleting.current) {
      isCompleting.current = true;
      complete().then((analysisId) => {
        router.push(`/resultat/${analysisId}`);
      });
    }
  }, [isComplete, complete, router]);

  const handleAnswer = (answer: unknown) => {
    if (currentQuestion) {
      submitAnswer(currentQuestion.id, answer);
    }
  };

  const handleCloseClick = () => {
    setShowExitModal(true);
  };

  const handleQuit = () => {
    setShowExitModal(false);
    reset();
    router.push("/");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDraft();
      setShowExitModal(false);
      reset();
      router.push("/compte");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoginToSave = () => {
    if (sessionId) {
      sessionStorage.setItem(PENDING_SESSION_KEY, sessionId);
    }
    setShowExitModal(false);
    router.push("/login?redirect=/questionnaire/resume");
  };

  const canGoBack = progress && progress.current > 1;

  // Show error state
  if (resumeError || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Impossible de reprendre
          </h1>
          <p className="text-gray-500 mb-6">
            {resumeError || error}
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  // Show loading while resuming
  if (isLoading && !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-500">Reprise de votre questionnaire...</p>
        </div>
      </div>
    );
  }

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
            onClick={handleCloseClick}
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

      {/* Exit Modal */}
      <SaveDraftModal
        isOpen={showExitModal}
        isAuthenticated={isAuthenticated}
        isSaving={isSaving}
        onClose={() => setShowExitModal(false)}
        onQuit={handleQuit}
        onSave={handleSave}
        onLoginToSave={handleLoginToSave}
      />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-emerald-500 mx-auto mb-4" />
        <p className="text-gray-500">Chargement...</p>
      </div>
    </div>
  );
}

export default function ResumeQuestionnairePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResumeQuestionnaireContent />
    </Suspense>
  );
}
