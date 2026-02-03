import { InsuranceType, QuestionConfig } from "@/shared/types/questionnaire";
import { autoQuestions } from "./auto";
import { habitationQuestions } from "./habitation";
import { gavQuestions } from "./gav";
import { mutuelleQuestions } from "./mutuelle";

export const questionConfigs: Record<InsuranceType, QuestionConfig[]> = {
  auto: autoQuestions,
  habitation: habitationQuestions,
  gav: gavQuestions,
  mutuelle: mutuelleQuestions,
};

export function getQuestionsForType(type: InsuranceType): QuestionConfig[] {
  return questionConfigs[type] || [];
}
