"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { motion } from "motion/react";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import { AuthLayout } from "@/frontend/components/auth/AuthLayout";
import { SocialButtons } from "@/frontend/components/auth/SocialButtons";
import { Divider } from "@/frontend/components/auth/Divider";
import { LoginForm } from "@/frontend/components/auth/LoginForm";
import { useAuth } from "@/frontend/hooks/useAuth";
import { ErrorMessage } from "@/frontend/components/ui/ErrorMessage";
import { Button } from "@/frontend/components/ui/button";

function MFAForm({
  onSubmit,
  onBack,
  isLoading,
  error,
}: {
  onSubmit: (code: string) => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (digit && index === 5) {
      const code = newDigits.join("");
      if (code.length === 6) {
        onSubmit(code);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedData[i] || "";
      }
      setDigits(newDigits);

      // Focus last filled input or submit
      const lastIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();

      if (pastedData.length === 6) {
        onSubmit(pastedData);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length === 6) {
      onSubmit(code);
    }
  };

  const isComplete = digits.every((d) => d !== "");

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[400px] bg-white border border-gray-200 rounded-lg p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Shield className="w-7 h-7 text-emerald-600" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-semibold text-gray-900"
          >
            Vérification en deux étapes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-2 text-sm text-gray-500"
          >
            Entrez le code de votre application d&apos;authentification
          </motion.p>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <ErrorMessage message={error} />
          </motion.div>
        )}

        {/* Code input form */}
        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Code à 6 chiffres
            </label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  className={`
                    w-12 h-14 text-center text-xl font-semibold
                    border rounded-lg transition-all duration-150
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${digit ? "border-emerald-300 bg-emerald-50/50" : "border-gray-200 bg-white"}
                    ${error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}
                  `}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400 text-center">
              Ouvrez votre application (Google Authenticator, Authy...)
            </p>
          </motion.div>

          {/* Submit button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Button
              type="submit"
              disabled={!isComplete || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Vérifier"
              )}
            </Button>

            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const action = searchParams.get("action");
  const packageId = searchParams.get("packageId");
  const priceId = searchParams.get("priceId");
  const { signIn, signInWithProvider, verifyMFALogin, isLoading, isMFALoading, error, clearError } = useAuth();

  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaError, setMfaError] = useState<string | null>(null);

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

  const handleLogin = async (email: string, password: string) => {
    clearError();
    setMfaError(null);
    const result = await signIn(email, password);

    if (result.success) {
      if ("mfaRequired" in result && result.mfaRequired) {
        setMfaRequired(true);
        setMfaFactorId(result.factorId);
      } else {
        router.push(getRedirectUrl());
      }
    }
  };

  const handleMFASubmit = async (code: string) => {
    setMfaError(null);
    const result = await verifyMFALogin(mfaFactorId, code);
    if (result.success) {
      router.push(getRedirectUrl());
    } else {
      setMfaError(result.error);
    }
  };

  const handleMFABack = () => {
    setMfaRequired(false);
    setMfaFactorId("");
    setMfaError(null);
    clearError();
  };

  const handleGoogleLogin = async () => {
    clearError();
    signInWithProvider("google");
  };

  const handleFacebookLogin = async () => {
    clearError();
    signInWithProvider("facebook");
  };

  // Preserve all search params when switching to register
  const registerUrl = (() => {
    const params = new URLSearchParams();
    if (redirect) params.set("redirect", redirect);
    if (action) params.set("action", action);
    if (packageId) params.set("packageId", packageId);
    if (priceId) params.set("priceId", priceId);
    const queryString = params.toString();
    return queryString ? `/register?${queryString}` : "/register";
  })();

  // MFA verification screen
  if (mfaRequired) {
    return (
      <MFAForm
        onSubmit={handleMFASubmit}
        onBack={handleMFABack}
        isLoading={isMFALoading}
        error={mfaError}
      />
    );
  }

  return (
    <AuthLayout
      title="Bon retour parmi nous"
      subtitle="Connectez-vous pour retrouver vos analyses"
    >
      <ErrorMessage message={error} className="mb-4" />

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
          href={registerUrl}
          className="text-emerald-600 hover:text-emerald-700 font-medium"
        >
          S&apos;inscrire
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLayout title="Chargement..." subtitle=""><div /></AuthLayout>}>
      <LoginContent />
    </Suspense>
  );
}
