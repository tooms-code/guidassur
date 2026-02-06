import { InsuranceType } from "@/shared/types/insurance";

export interface UserAnalysis {
  id: string;
  insuranceType: InsuranceType;
  insuranceLabel: string;
  score: number;
  scoreLabel: string;
  isUnlocked: boolean;
  insightsCount: number;
  potentialSavingsMin: number;
  potentialSavingsMax: number;
  createdAt: string;
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
  phone: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  createdAt: number;
}
