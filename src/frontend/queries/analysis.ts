"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AnalysisPublicDto,
  GenerateAnalysisRequestDto,
} from "@/backend/application/dtos/analysis.dto";
import { apiGet, apiPost } from "@/frontend/lib/api";

// ===== Storage Keys =====
const ANALYSIS_STORAGE_KEY = "guidassur_analysis_";
const ANALYSIS_META_KEY = "guidassur_analysis_meta_";

// ===== Helper to clear cache =====
export function clearAnalysisCache(id: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ANALYSIS_STORAGE_KEY + id);
  }
}

// ===== Query Keys =====
export const analysisKeys = {
  all: ["analysis"] as const,
  detail: (id: string) => [...analysisKeys.all, id] as const,
};

// ===== API Functions =====
async function generateAnalysisApi(
  data: GenerateAnalysisRequestDto
): Promise<AnalysisPublicDto> {
  const analysis = await apiPost<AnalysisPublicDto>(
    "/api/analysis/generate",
    data,
    "Erreur lors de la génération"
  );

  if (typeof window !== "undefined") {
    sessionStorage.setItem(ANALYSIS_STORAGE_KEY + analysis.id, JSON.stringify(analysis));
  }

  return analysis;
}

async function fetchAnalysis(id: string): Promise<AnalysisPublicDto> {
  // Check sessionStorage for local (non-saved) analyses only
  if (typeof window !== "undefined") {
    const cached = sessionStorage.getItem(ANALYSIS_STORAGE_KEY + id);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (!parsed.isSaved) {
        return parsed;
      }
    }
  }

  try {
    const analysis = await apiGet<AnalysisPublicDto>(`/api/analysis/${id}`, "Erreur lors du chargement");

    if (typeof window !== "undefined") {
      sessionStorage.setItem(ANALYSIS_STORAGE_KEY + id, JSON.stringify(analysis));
    }

    return analysis;
  } catch (error) {
    // If API fails, try sessionStorage as fallback
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(ANALYSIS_STORAGE_KEY + id);
      if (cached) {
        return JSON.parse(cached);
      }
    }
    throw error;
  }
}

async function unlockAnalysisApi(id: string): Promise<AnalysisPublicDto> {
  let body: Record<string, unknown> = {};
  if (typeof window !== "undefined") {
    const meta = sessionStorage.getItem(ANALYSIS_META_KEY + id);
    if (meta) {
      body = JSON.parse(meta);
    }
  }

  const analysis = await apiPost<AnalysisPublicDto>(
    `/api/analysis/${id}/unlock`,
    { ...body, useCredit: true },
    "Erreur lors du déblocage"
  );

  if (typeof window !== "undefined") {
    sessionStorage.setItem(ANALYSIS_STORAGE_KEY + id, JSON.stringify(analysis));
  }

  return analysis;
}

async function saveAnalysisApi(id: string): Promise<{ success?: boolean; alreadySaved?: boolean }> {
  let body: Record<string, unknown> = {};
  if (typeof window !== "undefined") {
    const meta = sessionStorage.getItem(ANALYSIS_META_KEY + id);
    if (meta) {
      body = JSON.parse(meta);
    }
  }

  return apiPost(`/api/analysis/${id}/save`, body, "Erreur lors de la sauvegarde");
}

// ===== Query Hooks =====
export function useAnalysis(id: string | null) {
  return useQuery({
    queryKey: analysisKeys.detail(id!),
    queryFn: () => fetchAnalysis(id!),
    enabled: !!id,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
}

// ===== Mutation Hooks =====
export function useGenerateAnalysis() {
  return useMutation({
    mutationFn: generateAnalysisApi,
  });
}

export function useUnlockAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlockAnalysisApi,
    onSuccess: (data, id) => {
      queryClient.setQueryData(analysisKeys.detail(id), data);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(ANALYSIS_STORAGE_KEY + id, JSON.stringify(data));
      }
    },
  });
}

export function useSaveAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveAnalysisApi,
    onSuccess: (_, id) => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(ANALYSIS_STORAGE_KEY + id);
        sessionStorage.removeItem(ANALYSIS_META_KEY + id);
      }
      queryClient.invalidateQueries({ queryKey: analysisKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["user", "analyses"] });
    },
  });
}

// ===== Re-exports =====
export type { AnalysisPublicDto, GenerateAnalysisRequestDto };
