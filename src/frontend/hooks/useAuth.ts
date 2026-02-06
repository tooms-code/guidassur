"use client";

import { useCurrentUser, useLogin, useRegister, useLogout, useMFAChallenge } from "@/frontend/queries/auth";

type OAuthProvider = "google" | "facebook";

interface SignInSuccessResult {
  success: true;
  mfaRequired?: false;
}

interface SignInMFAResult {
  success: true;
  mfaRequired: true;
  factorId: string;
}

interface SignInErrorResult {
  success: false;
  error: string;
}

type SignInResult = SignInSuccessResult | SignInMFAResult | SignInErrorResult;

/**
 * Unified auth hook that wraps query hooks with convenience methods
 */
export function useAuth() {
  const { data: user, isLoading: isUserLoading, error: queryError } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const mfaChallengeMutation = useMFAChallenge();

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });

      if (result.mfaRequired && result.factorId) {
        return {
          success: true,
          mfaRequired: true,
          factorId: result.factorId,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur de connexion",
      };
    }
  };

  const verifyMFALogin = async (factorId: string, code: string) => {
    try {
      await mfaChallengeMutation.mutateAsync({ factorId, code });
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : "Code invalide",
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
    mfaChallengeMutation.reset();
  };

  const error =
    loginMutation.error?.message ||
    registerMutation.error?.message ||
    mfaChallengeMutation.error?.message ||
    (queryError instanceof Error ? queryError.message : null);

  return {
    user: user || null,
    isLoading: isUserLoading || loginMutation.isPending || registerMutation.isPending || mfaChallengeMutation.isPending,
    isMFALoading: mfaChallengeMutation.isPending,
    error,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    verifyMFALogin,
    clearError,
  };
}
