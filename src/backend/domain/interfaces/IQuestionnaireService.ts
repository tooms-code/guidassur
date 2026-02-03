import {
  InsuranceType,
  Question,
  Progress,
} from "@/shared/types/questionnaire";
import { AnalysisResult } from "@/backend/domain/entities/AnalysisResult";

export interface StartResult {
  sessionId: string;
  question: Question;
  progress: Progress;
}

export interface NextResult {
  question?: Question;
  progress?: Progress;
  complete?: boolean;
  canComplete?: boolean;
}

export interface PrevResult {
  question: Question;
  progress: Progress;
}

export interface CompleteResult {
  analysisId: string;
  analysis: AnalysisResult;
  insuranceType: InsuranceType;
  answers: Record<string, unknown>;
}

export interface SaveDraftResult {
  success: boolean;
  draftId: string;
}

export interface IQuestionnaireService {
  start(type: InsuranceType): Promise<StartResult>;
  next(
    sessionId: string,
    questionId: string,
    answer: unknown
  ): Promise<NextResult>;
  prev(sessionId: string): Promise<PrevResult>;
  complete(sessionId: string): Promise<CompleteResult>;
  saveDraft(sessionId: string, email?: string): Promise<SaveDraftResult>;
}
