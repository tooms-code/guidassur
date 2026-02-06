import {
  InsuranceType,
  Question,
  Progress,
} from "@/shared/types/questionnaire";
import { AnalysisResult } from "@/backend/domain/entities/AnalysisResult";
import { QuestionnaireSession } from "@/backend/domain/entities/QuestionnaireSession";

export interface StartParams {
  type: InsuranceType;
  userId?: string;
  initialPrice?: number; // Prix annuel renseigné au début du questionnaire
}

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
  draftId: string;
}

export interface GetUserDraftsResult {
  drafts: QuestionnaireSession[];
}

export interface ResumeResult {
  sessionId: string;
  type: InsuranceType;
  question: Question;
  progress: Progress;
}

export interface IQuestionnaireService {
  start(params: StartParams): Promise<StartResult>;
  next(
    sessionId: string,
    questionId: string,
    answer: unknown
  ): Promise<NextResult>;
  prev(sessionId: string): Promise<PrevResult>;
  complete(sessionId: string): Promise<CompleteResult>;
  saveDraft(sessionId: string, email?: string): Promise<SaveDraftResult>;
  deleteDraft(draftId: string, userId: string): Promise<void>;
  abandonSession(sessionId: string): Promise<void>;
  // User-related methods
  getUserDrafts(userId: string): Promise<GetUserDraftsResult>;
  getSession(sessionId: string): Promise<QuestionnaireSession | null>;
  resume(sessionId: string, userId?: string): Promise<ResumeResult>;
}
