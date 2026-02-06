// Provider factory - returns Supabase implementations

import type { IAuthProvider } from "@/backend/domain/interfaces/IAuthProvider";
import type { IUserService } from "@/backend/domain/interfaces/IUserService";
import type { IPaymentService } from "@/backend/domain/interfaces/IPaymentService";
import type { IQuestionnaireService } from "@/backend/domain/interfaces/IQuestionnaireService";

// =============================================
// Auth Provider
// =============================================
export function getAuthProvider(): IAuthProvider {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { supabaseAuthProvider } = require("./supabase/SupabaseAuthProvider");
  return supabaseAuthProvider;
}

// =============================================
// User Service
// =============================================
export function getUserServiceProvider(): IUserService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { supabaseUserService } = require("./supabase/SupabaseUserService");
  return supabaseUserService;
}

// =============================================
// Analysis Service
// =============================================
export function getAnalysisService() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { supabaseAnalysisService } = require("./supabase/SupabaseAnalysisService");
  return supabaseAnalysisService;
}

// =============================================
// Payment Service
// =============================================
export function getPaymentServiceProvider(): IPaymentService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { supabasePaymentService } = require("./supabase/SupabasePaymentService");
  return supabasePaymentService;
}

// =============================================
// Questionnaire Service
// =============================================
export function getQuestionnaireServiceProvider(): IQuestionnaireService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { supabaseQuestionnaireService } = require("./supabase/SupabaseQuestionnaireService");
  return supabaseQuestionnaireService;
}
