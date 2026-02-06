"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AuthResponseDto,
  MeResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
  UserDto,
} from "@/backend/application/dtos/auth.dto";
import { apiGet, apiPost } from "@/frontend/lib/api";

// ===== Types =====
export interface LoginResult extends AuthResponseDto {
  mfaRequired?: boolean;
  factorId?: string;
}

export interface MFAChallengeRequest {
  factorId: string;
  code: string;
}

// ===== Query Keys =====
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

// ===== API Functions =====
async function fetchCurrentUser(): Promise<UserDto | null> {
  try {
    const data = await apiGet<MeResponseDto>("/api/auth/me");
    return data.user;
  } catch {
    return null;
  }
}

// ===== Query Hooks =====
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: fetchCurrentUser,
    staleTime: 30 * 1000,
    retry: false,
  });
}

// ===== Mutation Hooks =====
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequestDto) =>
      apiPost<LoginResult>("/api/auth/login", credentials, "Erreur de connexion"),
    onSuccess: (data) => {
      if (!data.mfaRequired && data.user) {
        queryClient.setQueryData(authKeys.user(), data.user);
      }
    },
  });
}

export function useMFAChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MFAChallengeRequest) =>
      apiPost<AuthResponseDto>("/api/auth/mfa/challenge", data, "Code invalide"),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequestDto) =>
      apiPost<AuthResponseDto>("/api/auth/register", data, "Erreur d'inscription"),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<void>("/api/auth/logout"),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

// ===== Re-exports =====
export type { UserDto, LoginRequestDto, RegisterRequestDto };
