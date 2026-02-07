"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { AuthLayout } from "@/frontend/components/auth/AuthLayout";
import { SocialButtons } from "@/frontend/components/auth/SocialButtons";
import { Divider } from "@/frontend/components/auth/Divider";
import { RegisterForm } from "@/frontend/components/auth/RegisterForm";
import { useAuth } from "@/frontend/hooks/useAuth";
import { ErrorMessage } from "@/frontend/components/ui/ErrorMessage";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const action = searchParams.get("action");
  const packageId = searchParams.get("packageId");
  const priceId = searchParams.get("priceId");
  const { signUp, signInWithProvider, isLoading, error, clearError } = useAuth();

  // Build redirect URL with all params preserved
  const getRedirectUrl = () => {
    if (!redirect) return "/compte";

    // Build URL with action params if present
    const url = new URL(redirect, window.location.origin);
    if (action) url.searchParams.set("action", action);
    if (packageId) url.searchParams.set("packageId", packageId);
    if (priceId) url.searchParams.set("priceId", priceId);
    return url.pathname + url.search;
  };

  const handleRegister = async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    clearError();
    const result = await signUp(email, password, fullName);
    if (result.success) {
      router.push(getRedirectUrl());
    }
  };

  const handleGoogleRegister = async () => {
    clearError();
    const result = await signInWithProvider("google");
    if (result.success) {
      router.push(getRedirectUrl());
    }
  };

  const handleFacebookRegister = async () => {
    clearError();
    const result = await signInWithProvider("facebook");
    if (result.success) {
      router.push(getRedirectUrl());
    }
  };

  // Preserve all search params when switching to login
  const loginUrl = (() => {
    const params = new URLSearchParams();
    if (redirect) params.set("redirect", redirect);
    if (action) params.set("action", action);
    if (packageId) params.set("packageId", packageId);
    if (priceId) params.set("priceId", priceId);
    const queryString = params.toString();
    return queryString ? `/login?${queryString}` : "/login";
  })();

  return (
    <AuthLayout
      title="Rejoignez Guidassur"
      subtitle="Analysez vos contrats et ne payez plus jamais trop cher"
    >
      <ErrorMessage message={error} className="mb-4" />

      <SocialButtons
        onGoogleClick={handleGoogleRegister}
        onFacebookClick={handleFacebookRegister}
        isLoading={isLoading}
      />

      <Divider />

      <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

      <p className="mt-6 text-center text-sm text-gray-500">
        Déjà un compte ?{" "}
        <Link
          href={loginUrl}
          className="text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthLayout title="Chargement..." subtitle=""><div /></AuthLayout>}>
      <RegisterContent />
    </Suspense>
  );
}
