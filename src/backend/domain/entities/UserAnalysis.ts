import { InsuranceType } from "@/shared/types/insurance";

export interface UserAnalysis {
  id: string;
  insuranceType: InsuranceType;
  score: number;
  scoreLabel: string;
  isUnlocked: boolean;
  insightsCount: number;
  potentialSavingsMin: number;
  potentialSavingsMax: number;
  createdAt: number;
}

export interface UserStats {
  totalAnalyses: number;
  unlockedAnalyses: number;
  totalPotentialSavingsMin: number;
  totalPotentialSavingsMax: number;
  averageScore: number;
  analysesByType: Record<InsuranceType, number>;
  scoreEvolution: { date: string; score: number }[];
}

export interface UserSettings {
  email: string;
  fullName: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  createdAt: number;
}
