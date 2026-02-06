import { InsuranceType } from "@/shared/types/insurance";
import { PaginatedResponse } from "@/shared/types/pagination";
import { UserAnalysis, UserStats, UserSettings } from "@/backend/domain/entities/UserAnalysis";
import { AnalysisSortField, SortOrder } from "@/backend/domain/interfaces/IUserService";

// ===== Request DTOs =====

export interface GetAnalysesRequestDto {
  insuranceType?: InsuranceType;
  isUnlocked?: boolean;
  sortBy?: AnalysisSortField;
  sortOrder?: SortOrder;
  limit?: number;
  offset?: number;
}

export interface UpdateSettingsRequestDto {
  fullName?: string;
  phone?: string;
  emailNotifications?: boolean;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

export interface Verify2FARequestDto {
  code: string;
}

export interface Disable2FARequestDto {
  code: string;
}

export interface DeleteAccountRequestDto {
  password: string;
  mfaCode?: string;
}

// ===== Response DTOs =====

export interface UserAnalysisDto {
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

export type GetAnalysesResponseDto = PaginatedResponse<UserAnalysisDto>;

export interface UserStatsDto {
  totalAnalyses: number;
  unlockedAnalyses: number;
  totalPotentialSavingsMin: number;
  totalPotentialSavingsMax: number;
  averageScore: number;
  analysesByType: {
    type: InsuranceType;
    label: string;
    count: number;
  }[];
  scoreEvolution: { date: string; score: number }[];
}

export interface UserSettingsDto {
  email: string;
  fullName: string;
  phone: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  memberSince: string;
}

export interface EnrollMFAResponseDto {
  factorId: string;
  secret: string;
  qrCodeUrl: string;
}

// ===== Mappers =====

const insuranceLabels: Record<InsuranceType, string> = {
  [InsuranceType.AUTO]: "Assurance Auto",
  [InsuranceType.HABITATION]: "Assurance Habitation",
  [InsuranceType.GAV]: "Garantie Accidents de la Vie",
  [InsuranceType.MUTUELLE]: "Mutuelle Santé",
};

export function mapUserAnalysisToDto(analysis: UserAnalysis): UserAnalysisDto {
  return {
    id: analysis.id,
    insuranceType: analysis.insuranceType,
    insuranceLabel: insuranceLabels[analysis.insuranceType],
    score: analysis.score,
    scoreLabel: analysis.scoreLabel,
    isUnlocked: analysis.isUnlocked,
    insightsCount: analysis.insightsCount,
    potentialSavingsMin: analysis.potentialSavingsMin,
    potentialSavingsMax: analysis.potentialSavingsMax,
    createdAt: new Date(analysis.createdAt).toISOString(),
  };
}

export function mapUserStatsToDto(stats: UserStats): UserStatsDto {
  const analysesByType = Object.entries(stats.analysesByType).map(([type, count]) => ({
    type: type as InsuranceType,
    label: insuranceLabels[type as InsuranceType],
    count,
  }));

  return {
    totalAnalyses: stats.totalAnalyses,
    unlockedAnalyses: stats.unlockedAnalyses,
    totalPotentialSavingsMin: stats.totalPotentialSavingsMin,
    totalPotentialSavingsMax: stats.totalPotentialSavingsMax,
    averageScore: stats.averageScore,
    analysesByType,
    scoreEvolution: stats.scoreEvolution,
  };
}

export function mapUserSettingsToDto(settings: UserSettings): UserSettingsDto {
  return {
    email: settings.email,
    fullName: settings.fullName,
    phone: settings.phone,
    twoFactorEnabled: settings.twoFactorEnabled,
    emailNotifications: settings.emailNotifications,
    memberSince: new Date(settings.createdAt).toISOString(),
  };
}
