"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/frontend/components/auth/AuthLayout";
import { SocialButtons } from "@/frontend/components/auth/SocialButtons";
import { Divider } from "@/frontend/components/auth/Divider";
import { RegisterForm } from "@/frontend/components/auth/RegisterForm";
import { useAuth } from "@/frontend/hooks/useAuth";
import { AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signInWithProvider, isLoading, error, clearError } = useAuth();

  const handleRegister = async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    clearError();
    const result = await signUp(email, password, fullName);
    if (result.success) {
      router.push("/compte");
    }
  };

  const handleGoogleRegister = async () => {
    clearError();
    const result = await signInWithProvider("google");
    if (result.success) {
      router.push("/compte");
    }
  };

  const handleFacebookRegister = async () => {
    clearError();
    const result = await signInWithProvider("facebook");
    if (result.success) {
      router.push("/compte");
    }
  };

  return (
    <AuthLayout
      title="Rejoignez Guidassur"
      subtitle="Analysez vos contrats et ne payez plus jamais trop cher"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

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
          href="/login"
          className="text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  );
}
