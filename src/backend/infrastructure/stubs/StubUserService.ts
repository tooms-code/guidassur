import {
  IUserService,
  GetAnalysesParams,
  GetAnalysesResult,
  UpdateProfileParams,
} from "@/backend/domain/interfaces/IUserService";
import { UserAnalysis, UserStats, UserSettings } from "@/backend/domain/entities/UserAnalysis";
import { InsuranceType } from "@/shared/types/insurance";

// Mock data store
const userAnalyses = new Map<string, UserAnalysis[]>();
const userSettings = new Map<string, UserSettings>();

// Generate mock analyses for a user
function generateMockAnalyses(userId: string): UserAnalysis[] {
  const types: InsuranceType[] = [
    InsuranceType.AUTO,
    InsuranceType.HABITATION,
    InsuranceType.GAV,
    InsuranceType.MUTUELLE,
  ];

  const getScoreLabel = (score: number): string => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Bon";
    if (score >= 55) return "Correct";
    if (score >= 40) return "À améliorer";
    return "Insuffisant";
  };

  const analyses: UserAnalysis[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Generate 5-8 mock analyses
  const count = 5 + Math.floor(Math.random() * 4);

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const score = 35 + Math.floor(Math.random() * 60);
    const isUnlocked = Math.random() > 0.4;

    analyses.push({
      id: `analysis_${userId}_${i}`,
      insuranceType: type,
      score,
      scoreLabel: getScoreLabel(score),
      isUnlocked,
      insightsCount: 4 + Math.floor(Math.random() * 5),
      potentialSavingsMin: 20 + Math.floor(Math.random() * 80),
      potentialSavingsMax: 100 + Math.floor(Math.random() * 200),
      createdAt: now - i * dayMs * (2 + Math.floor(Math.random() * 5)),
    });
  }

  return analyses.sort((a, b) => b.createdAt - a.createdAt);
}

class StubUserService implements IUserService {
  private getOrCreateAnalyses(userId: string): UserAnalysis[] {
    if (!userAnalyses.has(userId)) {
      userAnalyses.set(userId, generateMockAnalyses(userId));
    }
    return userAnalyses.get(userId)!;
  }

  private getOrCreateSettings(userId: string, email: string): UserSettings {
    if (!userSettings.has(userId)) {
      userSettings.set(userId, {
        email,
        fullName: email.split("@")[0],
        twoFactorEnabled: false,
        emailNotifications: true,
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      });
    }
    return userSettings.get(userId)!;
  }

  async getAnalyses(params: GetAnalysesParams): Promise<GetAnalysesResult> {
    await new Promise((r) => setTimeout(r, 300));

    let analyses = [...this.getOrCreateAnalyses(params.userId)];

    // Filter by type
    if (params.insuranceType) {
      analyses = analyses.filter((a) => a.insuranceType === params.insuranceType);
    }

    // Filter by unlocked status
    if (params.isUnlocked !== undefined) {
      analyses = analyses.filter((a) => a.isUnlocked === params.isUnlocked);
    }

    // Sort
    const sortField = params.sortBy || "date";
    const sortOrder = params.sortOrder || "desc";

    analyses.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = a.createdAt - b.createdAt;
          break;
        case "score":
          comparison = a.score - b.score;
          break;
        case "type":
          comparison = a.insuranceType.localeCompare(b.insuranceType);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    const total = analyses.length;
    const offset = params.offset || 0;
    const limit = params.limit || 10;
    const paginatedAnalyses = analyses.slice(offset, offset + limit);

    return {
      analyses: paginatedAnalyses,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getStats(userId: string): Promise<UserStats> {
    await new Promise((r) => setTimeout(r, 300));

    const analyses = this.getOrCreateAnalyses(userId);

    const analysesByType: Record<InsuranceType, number> = {
      [InsuranceType.AUTO]: 0,
      [InsuranceType.HABITATION]: 0,
      [InsuranceType.GAV]: 0,
      [InsuranceType.MUTUELLE]: 0,
    };

    let totalSavingsMin = 0;
    let totalSavingsMax = 0;
    let totalScore = 0;

    for (const analysis of analyses) {
      analysesByType[analysis.insuranceType]++;
      if (analysis.isUnlocked) {
        totalSavingsMin += analysis.potentialSavingsMin;
        totalSavingsMax += analysis.potentialSavingsMax;
      }
      totalScore += analysis.score;
    }

    // Generate score evolution (last 6 months)
    const scoreEvolution: { date: string; score: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      scoreEvolution.push({
        date: date.toISOString().slice(0, 7), // YYYY-MM
        score: 50 + Math.floor(Math.random() * 40),
      });
    }

    return {
      totalAnalyses: analyses.length,
      unlockedAnalyses: analyses.filter((a) => a.isUnlocked).length,
      totalPotentialSavingsMin: totalSavingsMin,
      totalPotentialSavingsMax: totalSavingsMax,
      averageScore: analyses.length > 0 ? Math.round(totalScore / analyses.length) : 0,
      analysesByType,
      scoreEvolution,
    };
  }

  async getSettings(userId: string): Promise<UserSettings> {
    await new Promise((r) => setTimeout(r, 200));
    return this.getOrCreateSettings(userId, "user@example.com");
  }

  async updateProfile(params: UpdateProfileParams): Promise<UserSettings> {
    await new Promise((r) => setTimeout(r, 300));

    const settings = this.getOrCreateSettings(params.userId, "user@example.com");

    if (params.fullName !== undefined) {
      settings.fullName = params.fullName;
    }
    if (params.emailNotifications !== undefined) {
      settings.emailNotifications = params.emailNotifications;
    }

    userSettings.set(params.userId, settings);
    return settings;
  }

  async deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
    await new Promise((r) => setTimeout(r, 500));

    // Clean up mock data
    userAnalyses.delete(userId);
    userSettings.delete(userId);

    return { success: true };
  }
}

export const stubUserService = new StubUserService();
