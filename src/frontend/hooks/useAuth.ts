"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AuthResponseDto,
  MeResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
  UserDto,
} from "@/backend/application/dtos/auth.dto";

type OAuthProvider = "google" | "facebook";

// API functions
async function fetchCurrentUser(): Promise<UserDto | null> {
  const response = await fetch("/api/auth/me");
  if (!response.ok) return null;
  const data: MeResponseDto = await response.json();
  return data.user;
}

async function loginUser(credentials: LoginRequestDto): Promise<AuthResponseDto> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur de connexion");
  }

  return response.json();
}

async function registerUser(data: RegisterRequestDto): Promise<AuthResponseDto> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur d'inscription");
  }

  return response.json();
}

async function logoutUser(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

// Hook
export function useAuth() {
  const queryClient = useQueryClient();

  // Query for current user
  const {
    data: user,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], data.user);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], data.user);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  // Actions
  const signIn = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : "Erreur de connexion",
      };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      await registerMutation.mutateAsync({ email, password, fullName });
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : "Erreur d'inscription",
      };
    }
  };

  const signInWithProvider = async (provider: OAuthProvider) => {
    window.location.href = `/api/auth/provider/${provider}`;
    return { success: true as const };
  };

  const signOut = async () => {
    await logoutMutation.mutateAsync();
  };

  const clearError = () => {
    loginMutation.reset();
    registerMutation.reset();
  };

  // Derived error state
  const error =
    loginMutation.error?.message ||
    registerMutation.error?.message ||
    (queryError instanceof Error ? queryError.message : null);

  return {
    user: user || null,
    isLoading:
      isLoading || loginMutation.isPending || registerMutation.isPending,
    error,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    clearError,
  };
}
