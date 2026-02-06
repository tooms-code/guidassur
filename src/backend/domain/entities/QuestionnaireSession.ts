import { InsuranceType } from "@/shared/types/questionnaire";

export type SessionStatus = "in_progress" | "completed" | "abandoned";

export interface QuestionnaireSession {
  id: string;
  type: InsuranceType;
  answers: Record<string, unknown>;
  currentQuestionIndex: number;
  createdAt: number;
  updatedAt: number;
  // User linking
  userId?: string;
  email?: string;
  status: SessionStatus;
  // Analysis reference
  analysisId?: string;
}
