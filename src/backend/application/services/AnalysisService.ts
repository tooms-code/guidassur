import { AnalysisResult } from "@/backend/domain/entities/AnalysisResult";
import { InsuranceType } from "@/shared/types/insurance";
import { getAnalysisService } from "@/backend/infrastructure/providers";

export interface GenerateAnalysisParams {
  sessionId: string;
  insuranceType: InsuranceType;
  answers: Record<string, unknown>;
  userId?: string;
  persist?: boolean;
  existingId?: string;
}

class AnalysisService {
  private provider = getAnalysisService();

  async generate(params: GenerateAnalysisParams): Promise<AnalysisResult> {
    return this.provider.generate(params);
  }

  async getById(analysisId: string): Promise<AnalysisResult | null> {
    return this.provider.getById(analysisId);
  }

  async getBySessionId(sessionId: string): Promise<AnalysisResult | null> {
    return this.provider.getBySessionId(sessionId);
  }

  async getUserAnalyses(userId: string): Promise<AnalysisResult[]> {
    return this.provider.getUserAnalyses(userId);
  }

  async unlockAnalysis(analysisId: string): Promise<AnalysisResult | null> {
    return this.provider.unlockAnalysis(analysisId);
  }

  async saveToUser(
    analysisId: string,
    userId: string,
    answers?: Record<string, unknown>
  ): Promise<AnalysisResult | null> {
    return this.provider.saveToUser(analysisId, userId, answers);
  }

  async isOwnedByUser(analysisId: string, userId: string): Promise<boolean> {
    return this.provider.isOwnedByUser(analysisId, userId);
  }
}

export const analysisService = new AnalysisService();
