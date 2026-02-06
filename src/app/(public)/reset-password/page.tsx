"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Lock, Check, X, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { ErrorMessage } from "@/frontend/components/ui/ErrorMessage";
import { passwordRequirements, isPasswordValid } from "@/frontend/lib/passwordValidation";

// ============================================
// Password Requirements Display
// ============================================
function PasswordRequirements({ password }: { password: string }) {
  if (password.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      {passwordRequirements.map((req) => {
        const isValid = req.test(password);
        return (
          <div
            key={req.key}
            className={`flex items-center gap-2 text-xs ${
              isValid ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            {isValid ? (
              <Check size={12} className="text-emerald-500" />
            ) : (
              <X size={12} className="text-gray-300" />
            )}
            {req.label}
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// Main Page
// ============================================
export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading] = useState(false);
  const [error] = useState("");

  const passwordsMatch = password && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement reset password flow
  };

  // TODO: Add proper session validation and flow
  // For now, just show the form UI

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] bg-white border border-gray-200 rounded-lg p-8"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Nouveau mot de passe
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        <ErrorMessage message={error} className="mb-4" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <PasswordRequirements password={password} />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-sm text-red-500">
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isPasswordValid(password) || !passwordsMatch}
            className="w-full"
          >
            {isLoading ? "Modification..." : "Modifier mon mot de passe"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link
            href="/login"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Retour à la connexion
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
