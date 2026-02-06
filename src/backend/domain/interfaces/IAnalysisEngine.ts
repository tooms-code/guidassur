import { AnalysisResult } from "@/backend/domain/entities/AnalysisResult";
import { InsuranceType } from "@/shared/types/insurance";

export interface IAnalysisEngine {
  analyze(
    sessionId: string,
    insuranceType: InsuranceType,
    answers: Record<string, unknown>,
    existingId?: string
  ): AnalysisResult;
}
