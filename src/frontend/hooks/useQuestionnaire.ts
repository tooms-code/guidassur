"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import {
  StartQuestionnaireRequestDto,
  StartQuestionnaireResponseDto,
  AnswerQuestionRequestDto,
  NextQuestionResponseDto,
  PrevQuestionRequestDto,
  PrevQuestionResponseDto,
  CompleteQuestionnaireRequestDto,
  CompleteQuestionnaireResponseDto,
  SaveDraftRequestDto,
  SaveDraftResponseDto,
  ResumeQuestionnaireRequestDto,
  ResumeQuestionnaireResponseDto,
  QuestionDto,
  ProgressDto,
} from "@/backend/application/dtos/questionnaire.dto";
import { InsuranceType } from "@/shared/types/questionnaire";
import { apiPost } from "@/frontend/lib/api";

const ANALYSIS_STORAGE_KEY = "guidassur_analysis_";
const ANALYSIS_META_KEY = "guidassur_analysis_meta_";

// API functions
async function completeQuestionnaire(
  data: CompleteQuestionnaireRequestDto
): Promise<CompleteQuestionnaireResponseDto> {
  const result = await apiPost<CompleteQuestionnaireResponseDto>(
    "/api/questionnaire/complete",
    data,
    "Erreur lors de la finalisation"
  );

  // Store analysis in sessionStorage for reliable retrieval on results page
  if (typeof window !== "undefined" && result.analysis) {
    sessionStorage.setItem(
      ANALYSIS_STORAGE_KEY + result.analysisId,
      JSON.stringify(result.analysis)
    );
    sessionStorage.setItem(
      ANALYSIS_META_KEY + result.analysisId,
      JSON.stringify({
        sessionId: result.analysis.sessionId,
        insuranceType: result.insuranceType,
        answers: result.answers,
      })
    );
  }

  return result;
}

async function abandonSession(sessionId: string): Promise<void> {
  try {
    await apiPost("/api/questionnaire/abandon", { sessionId });
  } catch {
    // Silent fail - we're abandoning anyway
    console.error("Error abandoning session");
  }
}

// Hook
export function useQuestionnaire() {
  const queryClient = useQueryClient();

  // Local state for questionnaire session
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [type, setType] = useState<InsuranceType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionDto | null>(null);
  const [progress, setProgress] = useState<ProgressDto | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start mutation
  const startMutation = useMutation({
    mutationFn: (data: StartQuestionnaireRequestDto) =>
      apiPost<StartQuestionnaireResponseDto>("/api/questionnaire/start", data, "Erreur lors du démarrage"),
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setCurrentQuestion(data.question);
      setProgress(data.progress);
      setIsComplete(false);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Answer mutation
  const answerMutation = useMutation({
    mutationFn: (data: AnswerQuestionRequestDto) =>
      apiPost<NextQuestionResponseDto>("/api/questionnaire/next", data, "Erreur lors de la soumission"),
    onSuccess: (data) => {
      if (data.complete) {
        setIsComplete(true);
      } else {
        setCurrentQuestion(data.question || null);
        setProgress(data.progress || null);
      }
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Prev mutation
  const prevMutation = useMutation({
    mutationFn: (data: PrevQuestionRequestDto) =>
      apiPost<PrevQuestionResponseDto>("/api/questionnaire/prev", data, "Erreur lors du retour"),
    onSuccess: (data) => {
      setCurrentQuestion(data.question);
      setProgress(data.progress);
      setIsComplete(false);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Complete mutation
  const completeMutation = useMutation({
    mutationFn: completeQuestionnaire,
  });

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: (data: SaveDraftRequestDto) =>
      apiPost<SaveDraftResponseDto>("/api/questionnaire/save-draft", data, "Erreur lors de la sauvegarde"),
  });

  // Resume mutation
  const resumeMutation = useMutation({
    mutationFn: (data: ResumeQuestionnaireRequestDto) =>
      apiPost<ResumeQuestionnaireResponseDto>("/api/questionnaire/resume", data, "Erreur lors de la reprise"),
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setType(data.type);
      setCurrentQuestion(data.question);
      setProgress(data.progress);
      setIsComplete(false);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Actions
  const start = useCallback(
    async (insuranceType: InsuranceType, initialPrice?: number) => {
      setType(insuranceType);
      setError(null);
      await startMutation.mutateAsync({ type: insuranceType, initialPrice });
    },
    [startMutation]
  );

  const submitQuestionAnswer = useCallback(
    async (questionId: string, answer: unknown) => {
      if (!sessionId) return;
      setError(null);
      await answerMutation.mutateAsync({ sessionId, questionId, answer });
    },
    [sessionId, answerMutation]
  );

  const goBack = useCallback(async () => {
    if (!sessionId) return;
    setError(null);
    await prevMutation.mutateAsync({ sessionId });
  }, [sessionId, prevMutation]);

  const complete = useCallback(async (): Promise<string> => {
    if (!sessionId) throw new Error("No session");
    const result = await completeMutation.mutateAsync({ sessionId });
    return result.analysisId;
  }, [sessionId, completeMutation]);

  const saveCurrentDraft = useCallback(
    async (email?: string): Promise<boolean> => {
      if (!sessionId) return false;
      try {
        await saveDraftMutation.mutateAsync({ sessionId, email });
        return true;
      } catch {
        return false;
      }
    },
    [sessionId, saveDraftMutation]
  );

  const resumeSession = useCallback(
    async (resumeSessionId: string) => {
      setError(null);
      await resumeMutation.mutateAsync({ sessionId: resumeSessionId });
    },
    [resumeMutation]
  );

  const reset = useCallback(() => {
    setSessionId(null);
    setType(null);
    setCurrentQuestion(null);
    setProgress(null);
    setIsComplete(false);
    setError(null);
    queryClient.invalidateQueries({ queryKey: ["questionnaire"] });
  }, [queryClient]);

  const abandon = useCallback(async () => {
    if (sessionId) {
      await abandonSession(sessionId);
    }
    reset();
  }, [sessionId, reset]);

  const isLoading =
    startMutation.isPending ||
    answerMutation.isPending ||
    prevMutation.isPending ||
    completeMutation.isPending ||
    resumeMutation.isPending;

  const isSubmitting = answerMutation.isPending || prevMutation.isPending;

  return {
    // State
    sessionId,
    type,
    currentQuestion,
    progress,
    isLoading,
    isSubmitting,
    isComplete,
    error,

    // Actions
    start,
    submitAnswer: submitQuestionAnswer,
    goBack,
    complete,
    saveDraft: saveCurrentDraft,
    resume: resumeSession,
    reset,
    abandon,
  };
}
