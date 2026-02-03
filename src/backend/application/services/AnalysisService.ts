import { analysisEngine } from "@/backend/application/engine/AnalysisEngine";
import { AnalysisResult } from "@/backend/domain/entities/AnalysisResult";
import { InsuranceType } from "@/shared/types/insurance";

// In-memory storage for analyses (will be replaced by database)
const analysisStore = new Map<string, AnalysisResult>();

export interface GenerateAnalysisParams {
  sessionId: string;
  insuranceType: InsuranceType;
  answers: Record<string, unknown>;
}

class AnalysisService {
  async generate(params: GenerateAnalysisParams): Promise<AnalysisResult> {
    const { sessionId, insuranceType, answers } = params;

    // Generate the analysis using the engine
    const analysis = analysisEngine.analyze(sessionId, insuranceType, answers);

    // Store the analysis
    analysisStore.set(analysis.id, analysis);

    return analysis;
  }

  async getById(analysisId: string): Promise<AnalysisResult | null> {
    return analysisStore.get(analysisId) || null;
  }

  async getBySessionId(sessionId: string): Promise<AnalysisResult | null> {
    for (const analysis of analysisStore.values()) {
      if (analysis.sessionId === sessionId) {
        return analysis;
      }
    }
    return null;
  }
}

export const analysisService = new AnalysisService();
