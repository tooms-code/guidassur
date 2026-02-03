"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FreeAnalysisResponseDto,
  FullAnalysisResponseDto,
  GenerateAnalysisRequestDto,
} from "@/backend/application/dtos/analysis.dto";

const ANALYSIS_STORAGE_KEY = "guidassur_analysis_";

async function generateAnalysis(
  data: GenerateAnalysisRequestDto
): Promise<FreeAnalysisResponseDto> {
  const response = await fetch("/api/analysis/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate analysis");
  }

  const analysis = await response.json();

  // Store in sessionStorage for reliability in dev mode
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ANALYSIS_STORAGE_KEY + analysis.id, JSON.stringify(analysis));
  }

  return analysis;
}

async function getFreeAnalysis(id: string): Promise<FreeAnalysisResponseDto> {
  // First try sessionStorage (more reliable in dev mode)
  if (typeof window !== "undefined") {
    const cached = sessionStorage.getItem(ANALYSIS_STORAGE_KEY + id);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  // Fallback to API
  const response = await fetch(`/api/analysis/${id}/free`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch analysis");
  }

  const analysis = await response.json();

  // Cache it
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ANALYSIS_STORAGE_KEY + id, JSON.stringify(analysis));
  }

  return analysis;
}

export function useGenerateAnalysis() {
  return useMutation({
    mutationFn: generateAnalysis,
  });
}

export function useFreeAnalysis(id: string | null) {
  return useQuery({
    queryKey: ["analysis", "free", id],
    queryFn: () => getFreeAnalysis(id!),
    enabled: !!id,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

const ANALYSIS_META_KEY = "guidassur_analysis_meta_";

async function unlockAnalysis(id: string): Promise<FullAnalysisResponseDto> {
  // Get meta data from sessionStorage for regeneration
  let body: Record<string, unknown> = {};
  if (typeof window !== "undefined") {
    const meta = sessionStorage.getItem(ANALYSIS_META_KEY + id);
    console.log("[Unlock] Meta for id:", id, meta ? "found" : "NOT FOUND");
    if (meta) {
      body = JSON.parse(meta);
    }
  }

  if (!body.sessionId || !body.insuranceType || !body.answers) {
    throw new Error("Données d'analyse introuvables. Refais le questionnaire.");
  }

  const response = await fetch(`/api/analysis/${id}/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to unlock analysis");
  }

  const analysis = await response.json();

  // Update sessionStorage with full analysis
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ANALYSIS_STORAGE_KEY + id + "_full", JSON.stringify(analysis));
  }

  return analysis;
}

export function useUnlockAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlockAnalysis,
    onSuccess: (data, id) => {
      // Update the query cache with the unlocked analysis
      queryClient.setQueryData(["analysis", "full", id], data);
    },
  });
}
