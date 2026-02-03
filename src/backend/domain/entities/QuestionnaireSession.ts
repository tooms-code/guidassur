import { InsuranceType } from "@/shared/types/questionnaire";

export interface QuestionnaireSession {
  id: string;
  type: InsuranceType;
  answers: Record<string, unknown>;
  currentQuestionIndex: number;
  createdAt: number;
  updatedAt: number;
}
