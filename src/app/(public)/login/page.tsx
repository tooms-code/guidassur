"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/frontend/components/auth/AuthLayout";
import { SocialButtons } from "@/frontend/components/auth/SocialButtons";
import { Divider } from "@/frontend/components/auth/Divider";
import { LoginForm } from "@/frontend/components/auth/LoginForm";
import { useAuth } from "@/frontend/hooks/useAuth";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithProvider, isLoading, error, clearError } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    clearError();
    const result = await signIn(email, password);
    if (result.success) {
      router.push("/compte");
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    const result = await signInWithProvider("google");
    if (result.success) {
      router.push("/compte");
    }
  };

  const handleFacebookLogin = async () => {
    clearError();
    const result = await signInWithProvider("facebook");
    if (result.success) {
      router.push("/compte");
    }
  };

  return (
    <AuthLayout
      title="Bon retour parmi nous"
      subtitle="Connectez-vous pour retrouver vos analyses"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <SocialButtons
        onGoogleClick={handleGoogleLogin}
        onFacebookClick={handleFacebookLogin}
        isLoading={isLoading}
      />

      <Divider />

      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

      <p className="mt-6 text-center text-sm text-gray-500">
        Pas de compte ?{" "}
        <Link
          href="/register"
          className="text-emerald-600 hover:text-emerald-700 font-medium"
        >
          S&apos;inscrire
        </Link>
      </p>
    </AuthLayout>
  );
}
