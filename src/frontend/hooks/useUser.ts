"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetAnalysesRequestDto,
  GetAnalysesResponseDto,
  UserStatsDto,
  UserSettingsDto,
  UpdateSettingsRequestDto,
  ChangePasswordRequestDto,
} from "@/backend/application/dtos/user.dto";

// ===== API Functions =====

async function fetchAnalyses(params: GetAnalysesRequestDto): Promise<GetAnalysesResponseDto> {
  const searchParams = new URLSearchParams();
  if (params.insuranceType) searchParams.set("type", params.insuranceType);
  if (params.isUnlocked !== undefined) searchParams.set("unlocked", String(params.isUnlocked));
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.offset) searchParams.set("offset", String(params.offset));

  const response = await fetch(`/api/user/analyses?${searchParams.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors du chargement");
  }
  return response.json();
}

async function fetchStats(): Promise<UserStatsDto> {
  const response = await fetch("/api/user/stats");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors du chargement");
  }
  return response.json();
}

async function fetchSettings(): Promise<UserSettingsDto> {
  const response = await fetch("/api/user/settings");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors du chargement");
  }
  return response.json();
}

async function updateSettings(data: UpdateSettingsRequestDto): Promise<UserSettingsDto> {
  const response = await fetch("/api/user/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la mise à jour");
  }
  return response.json();
}

async function changePassword(data: ChangePasswordRequestDto): Promise<void> {
  const response = await fetch("/api/user/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors du changement");
  }
}

async function deleteAccount(): Promise<void> {
  const response = await fetch("/api/user", { method: "DELETE" });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la suppression");
  }
}

async function enable2FA(): Promise<{ secret: string; qrCodeUrl: string }> {
  const response = await fetch("/api/user/2fa/enable", { method: "POST" });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'activation");
  }
  return response.json();
}

async function verify2FA(code: string): Promise<void> {
  const response = await fetch("/api/user/2fa/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Code invalide");
  }
}

async function disable2FA(code: string): Promise<void> {
  const response = await fetch("/api/user/2fa/disable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Code invalide");
  }
}

// ===== Hooks =====

export function useUserAnalyses(params: GetAnalysesRequestDto = {}) {
  return useQuery({
    queryKey: ["user", "analyses", params],
    queryFn: () => fetchAnalyses(params),
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ["user", "stats"],
    queryFn: fetchStats,
  });
}

export function useUserSettings() {
  return useQuery({
    queryKey: ["user", "settings"],
    queryFn: fetchSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "settings"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccount,
  });
}

export function useEnable2FA() {
  return useMutation({
    mutationFn: enable2FA,
  });
}

export function useVerify2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verify2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "settings"] });
    },
  });
}

export function useDisable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disable2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "settings"] });
    },
  });
}
