import { Insight, InsightCategory } from "./Insight";
import { InsuranceType } from "@/shared/types/insurance";

export type ScoreLabel = "Contrat solide" | "Perfectible" | "Faiblesses importantes";

export interface SavingsBreakdown {
  category: InsightCategory;
  min: number;
  max: number;
  description: string;
}

export interface AnalysisResult {
  id: string;
  sessionId: string;
  insuranceType: InsuranceType;
  score: number;
  scoreLabel: ScoreLabel;
  insights: Insight[];
  totalSavings: { min: number; max: number };
  savingsBreakdown: SavingsBreakdown[];
  createdAt: number;
  // User linking
  userId?: string;
  isUnlocked: boolean;
  // Store answers for later unlock (when user comes back)
  answers?: Record<string, unknown>;
}

export function calculateScoreLabel(score: number): ScoreLabel {
  if (score >= 75) return "Contrat solide";
  if (score >= 50) return "Perfectible";
  return "Faiblesses importantes";
}
