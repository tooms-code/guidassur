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
  QuestionDto,
  ProgressDto,
} from "@/backend/application/dtos/questionnaire.dto";
import { InsuranceType } from "@/shared/types/questionnaire";

// API functions
async function startQuestionnaire(
  data: StartQuestionnaireRequestDto
): Promise<StartQuestionnaireResponseDto> {
  const response = await fetch("/api/questionnaire/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors du démarrage");
  }

  return response.json();
}

async function submitAnswer(
  data: AnswerQuestionRequestDto
): Promise<NextQuestionResponseDto> {
  const response = await fetch("/api/questionnaire/next", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la soumission");
  }

  return response.json();
}

async function goToPrevQuestion(
  data: PrevQuestionRequestDto
): Promise<PrevQuestionResponseDto> {
  const response = await fetch("/api/questionnaire/prev", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors du retour");
  }

  return response.json();
}

const ANALYSIS_STORAGE_KEY = "guidassur_analysis_";
const ANALYSIS_META_KEY = "guidassur_analysis_meta_";

async function completeQuestionnaire(
  data: CompleteQuestionnaireRequestDto
): Promise<CompleteQuestionnaireResponseDto> {
  const response = await fetch("/api/questionnaire/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la finalisation");
  }

  const result = await response.json();

  // Store analysis in sessionStorage for reliable retrieval on results page
  if (typeof window !== "undefined" && result.analysis) {
    sessionStorage.setItem(
      ANALYSIS_STORAGE_KEY + result.analysisId,
      JSON.stringify(result.analysis)
    );
    // Store meta data (insuranceType, answers) for unlock regeneration
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

async function saveDraft(data: SaveDraftRequestDto): Promise<SaveDraftResponseDto> {
  const response = await fetch("/api/questionnaire/save-draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la sauvegarde");
  }

  return response.json();
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
    mutationFn: startQuestionnaire,
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
    mutationFn: submitAnswer,
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
    mutationFn: goToPrevQuestion,
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
    mutationFn: saveDraft,
  });

  // Actions
  const start = useCallback(
    async (insuranceType: InsuranceType) => {
      setType(insuranceType);
      setError(null);
      await startMutation.mutateAsync({ type: insuranceType });
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
        const result = await saveDraftMutation.mutateAsync({ sessionId, email });
        return result.success;
      } catch {
        return false;
      }
    },
    [sessionId, saveDraftMutation]
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

  const isLoading =
    startMutation.isPending ||
    answerMutation.isPending ||
    prevMutation.isPending ||
    completeMutation.isPending;

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
    reset,
  };
}
