"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/frontend/components/ui/button";
import { Check, X } from "lucide-react";

const passwordRequirements = [
  { key: "length", label: "8 caractères minimum", test: (p: string) => p.length >= 8 },
  { key: "lowercase", label: "Une minuscule", test: (p: string) => /[a-z]/.test(p) },
  { key: "uppercase", label: "Une majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { key: "number", label: "Un chiffre", test: (p: string) => /\d/.test(p) },
  { key: "special", label: "Un caractère spécial", test: (p: string) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(p) },
];

const registerSchema = z
  .object({
    fullName: z.string().optional(),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[a-z]/, "Doit contenir une minuscule")
      .regex(/[A-Z]/, "Doit contenir une majuscule")
      .regex(/\d/, "Doit contenir un chiffre")
      .regex(/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/, "Doit contenir un caractère spécial"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSubmit: (email: string, password: string, fullName?: string) => Promise<void>;
  isLoading?: boolean;
}

export function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  const handleFormSubmit = async (data: RegisterFormData) => {
    await onSubmit(data.email, data.password, data.fullName || undefined);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nom complet <span className="text-gray-400">(optionnel)</span>
        </label>
        <input
          {...register("fullName")}
          type="text"
          id="fullName"
          autoComplete="name"
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Jean Dupont"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          id="email"
          autoComplete="email"
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="vous@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Mot de passe
        </label>
        <input
          {...register("password")}
          type="password"
          id="password"
          autoComplete="new-password"
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="••••••••"
        />
        {password.length > 0 && (
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
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Confirmer le mot de passe
        </label>
        <input
          {...register("confirmPassword")}
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="••••••••"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Inscription..." : "S'inscrire"}
      </Button>
    </form>
  );
}
