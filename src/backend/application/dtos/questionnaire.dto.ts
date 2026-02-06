import {
  Question,
  Progress,
  InsuranceType,
} from "@/shared/types/questionnaire";
import { AnalysisPublicDto } from "./analysis.dto";

// Request DTOs
export interface StartQuestionnaireRequestDto {
  type: InsuranceType;
  initialPrice?: number; // Prix annuel renseigné au début du questionnaire
}

export interface AnswerQuestionRequestDto {
  sessionId: string;
  questionId: string;
  answer: unknown;
}

export interface PrevQuestionRequestDto {
  sessionId: string;
}

export interface CompleteQuestionnaireRequestDto {
  sessionId: string;
}

export interface SaveDraftRequestDto {
  sessionId: string;
  email?: string;
}

// Response DTOs
export interface QuestionDto {
  id: string;
  type: string;
  label: string;
  tip: { text: string; icon?: string } | null;
  required: boolean;
  options?: { value: string; label: string; tooltip?: string }[];
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  currentValue?: unknown;
}

export interface ProgressDto {
  current: number;
  total: number;
  percent: number;
  stepLabel: string;
}

export interface StartQuestionnaireResponseDto {
  sessionId: string;
  question: QuestionDto;
  progress: ProgressDto;
}

export interface NextQuestionResponseDto {
  question?: QuestionDto;
  progress?: ProgressDto;
  complete?: boolean;
  canComplete?: boolean;
}

export interface PrevQuestionResponseDto {
  question: QuestionDto;
  progress: ProgressDto;
}

export interface CompleteQuestionnaireResponseDto {
  analysisId: string;
  insuranceType: string;
  answers: Record<string, unknown>;
  analysis: AnalysisPublicDto;
}

export interface SaveDraftResponseDto {
  draftId: string;
}

export interface ResumeQuestionnaireRequestDto {
  sessionId: string;
}

export interface ResumeQuestionnaireResponseDto {
  sessionId: string;
  type: InsuranceType;
  question: QuestionDto;
  progress: ProgressDto;
}

// Mappers
export function toQuestionDto(question: Question): QuestionDto {
  return {
    id: question.id,
    type: question.type,
    label: question.label,
    tip: question.tip || null,
    required: question.required,
    options: question.options,
    unit: question.unit,
    placeholder: question.placeholder,
    min: question.min,
    max: question.max,
    currentValue: question.currentValue,
  };
}

export function toProgressDto(progress: Progress): ProgressDto {
  return {
    current: progress.current,
    total: progress.total,
    percent: progress.percent,
    stepLabel: progress.stepLabel,
  };
}
