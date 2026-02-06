"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GetAnalysesRequestDto,
  GetAnalysesResponseDto,
  UserStatsDto,
  UserSettingsDto,
  UpdateSettingsRequestDto,
  ChangePasswordRequestDto,
} from "@/backend/application/dtos/user.dto";
import { InsuranceType } from "@/shared/types/questionnaire";
import { authKeys } from "./auth";
import { apiGet, apiPost, apiPut, apiDelete } from "@/frontend/lib/api";

// ===== Types =====
export interface DraftDto {
  id: string;
  type: InsuranceType;
  answersCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface GetUserDraftsResponseDto {
  drafts: DraftDto[];
}

// ===== Query Keys =====
export const userKeys = {
  all: ["user"] as const,
  analyses: (params?: GetAnalysesRequestDto) => [...userKeys.all, "analyses", params] as const,
  stats: () => [...userKeys.all, "stats"] as const,
  settings: () => [...userKeys.all, "settings"] as const,
  drafts: () => [...userKeys.all, "drafts"] as const,
};

// ===== API Functions =====
function buildAnalysesUrl(params: GetAnalysesRequestDto): string {
  const searchParams = new URLSearchParams();
  if (params.insuranceType) searchParams.set("type", params.insuranceType);
  if (params.isUnlocked !== undefined) searchParams.set("unlocked", String(params.isUnlocked));
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.offset) searchParams.set("offset", String(params.offset));
  return `/api/user/analyses?${searchParams.toString()}`;
}

// ===== Query Hooks =====
export function useUserAnalyses(params: GetAnalysesRequestDto = {}) {
  return useQuery({
    queryKey: userKeys.analyses(params),
    queryFn: () => apiGet<GetAnalysesResponseDto>(buildAnalysesUrl(params), "Erreur lors du chargement"),
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => apiGet<UserStatsDto>("/api/user/stats", "Erreur lors du chargement"),
  });
}

export function useUserSettings() {
  return useQuery({
    queryKey: userKeys.settings(),
    queryFn: () => apiGet<UserSettingsDto>("/api/user/settings", "Erreur lors du chargement"),
  });
}

export function useUserDrafts() {
  return useQuery({
    queryKey: userKeys.drafts(),
    queryFn: () => apiGet<GetUserDraftsResponseDto>("/api/user/drafts", "Erreur lors du chargement"),
  });
}

// ===== Mutation Hooks =====
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingsRequestDto) =>
      apiPut<UserSettingsDto>("/api/user/settings", data, "Erreur lors de la mise à jour"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.settings() });
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequestDto) =>
      apiPut<void>("/api/auth/password", data, "Erreur lors du changement"),
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: () => apiPost<void>("/api/auth/password/reset", undefined, "Erreur lors de l'envoi"),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (password: string) =>
      apiDelete<void>("/api/user", { password }, "Erreur lors de la suppression"),
  });
}

export function useEnrollMFA() {
  return useMutation({
    mutationFn: () =>
      apiPost<{ factorId: string; secret: string; qrCodeUrl: string }>(
        "/api/auth/mfa/enroll",
        undefined,
        "Erreur lors de l'activation"
      ),
  });
}

export function useVerifyMFA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { code: string; factorId?: string }) =>
      apiPost<void>("/api/auth/mfa/verify", params, "Code invalide"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.settings() });
    },
  });
}

export function useUnenrollMFA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) =>
      apiPost<void>("/api/auth/mfa/unenroll", { code }, "Code invalide"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.settings() });
    },
  });
}

export function useDeleteDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draftId: string) =>
      apiDelete<void>(`/api/user/drafts/${draftId}`, undefined, "Erreur lors de la suppression"),
    onMutate: async (draftId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.drafts() });

      // Snapshot previous value
      const previousDrafts = queryClient.getQueryData<GetUserDraftsResponseDto>(userKeys.drafts());

      // Optimistic update: remove draft from cache immediately
      queryClient.setQueryData<GetUserDraftsResponseDto>(
        userKeys.drafts(),
        (old) => {
          if (!old) return old;
          return {
            drafts: old.drafts.filter((draft) => draft.id !== draftId),
          };
        }
      );

      // Return snapshot for rollback
      return { previousDrafts };
    },
    onError: (err, draftId, context) => {
      // Rollback on error
      if (context?.previousDrafts) {
        queryClient.setQueryData(userKeys.drafts(), context.previousDrafts);
      }
    },
    onSettled: () => {
      // Refetch to ensure sync with server
      queryClient.invalidateQueries({ queryKey: userKeys.drafts() });
    },
  });
}
