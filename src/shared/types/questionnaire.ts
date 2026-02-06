export type InsuranceType = "auto" | "habitation" | "gav" | "mutuelle";

export type QuestionType =
  | "single-choice"
  | "multi-choice"
  | "number"
  | "text"
  | "yes-no"
  | "yes-no-followup"
  | "consent";

export type TipIcon = "info" | "lightbulb" | "alert" | "money";

export interface QuestionTip {
  text: string;
  icon?: TipIcon;
}

export interface QuestionOption {
  value: string;
  label: string;
  tooltip?: string; // Texte explicatif affiché au survol
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  tip?: QuestionTip | null;
  required: boolean;
  options?: QuestionOption[];
  followupQuestions?: Question[];
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  currentValue?: unknown;
}

export interface Progress {
  current: number;
  total: number;
  percent: number;
  stepLabel: string;
}

export interface QuestionnaireStartRequest {
  type: InsuranceType;
}

export interface QuestionnaireStartResponse {
  sessionId: string;
  question: Question;
  progress: Progress;
}

export interface QuestionnaireNextRequest {
  sessionId: string;
  questionId: string;
  answer: unknown;
}

export interface QuestionnaireNextResponse {
  question?: Question;
  progress?: Progress;
  complete?: boolean;
  canComplete?: boolean;
}

export interface QuestionnairePrevRequest {
  sessionId: string;
}

export interface QuestionnairePrevResponse {
  question: Question;
  progress: Progress;
}

export interface QuestionnaireCompleteRequest {
  sessionId: string;
}

export interface QuestionnaireCompleteResponse {
  analysisId: string;
}

export interface QuestionnaireSaveDraftRequest {
  sessionId: string;
  email?: string;
}

export interface QuestionnaireSaveDraftResponse {
  success: boolean;
  draftId: string;
}

export interface QuestionConfig extends Omit<Question, "currentValue"> {
  step: string;
  dependsOn?: {
    questionId: string;
    equals?: unknown;
    contains?: string;
  };
}
