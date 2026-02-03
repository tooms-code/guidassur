import { InsuranceType } from "@/shared/types/insurance";
import {
  AnalysisResult,
  ScoreLabel,
} from "@/backend/domain/entities/AnalysisResult";
import {
  Insight,
  InsightStatus,
  InsightPriority,
  InsightCategory,
  InsightContent,
  SavingsImpact,
} from "@/backend/domain/entities/Insight";

// ===== Request DTOs =====

export interface GenerateAnalysisRequestDto {
  sessionId: string;
  insuranceType: InsuranceType;
  answers: Record<string, unknown>;
}

// ===== Response DTOs =====

export interface InsightDto {
  id: string;
  strategyId: string;
  category: InsightCategory;
  status: InsightStatus;
  priority: InsightPriority;
  title: string;
  description: string;
  fullDescription: string | null; // null for free tier (blurred)
  savingsMin: number | null;
  savingsMax: number | null;
  isFree: boolean;
}

export interface AnalysisResponseDto {
  id: string;
  sessionId: string;
  insuranceType: InsuranceType;
  score: number;
  scoreLabel: ScoreLabel;
  insights: InsightDto[];
  totalSavingsMin: number;
  totalSavingsMax: number;
  savingsBreakdown: SavingsBreakdownDto[];
  createdAt: string;
}

export interface SavingsBreakdownDto {
  category: InsightCategory;
  min: number;
  max: number;
  description: string;
}

export interface FreeAnalysisResponseDto {
  id: string;
  sessionId: string;
  insuranceType: InsuranceType;
  score: number;
  scoreLabel: ScoreLabel;
  freeInsights: InsightDto[];
  lockedInsightsCount: number;
  potentialSavingsMin: number;
  potentialSavingsMax: number;
  createdAt: string;
}

// ===== Mappers =====

export function mapInsightToDto(insight: Insight, showFull: boolean): InsightDto {
  return {
    id: insight.id,
    strategyId: insight.strategyId,
    category: insight.category,
    status: insight.status,
    priority: insight.priority,
    title: insight.content.title,
    description: insight.content.description,
    fullDescription: showFull ? insight.content.fullDescription : null,
    savingsMin: insight.savingsImpact?.min ?? null,
    savingsMax: insight.savingsImpact?.max ?? null,
    isFree: insight.isFreeInsight,
  };
}

export function mapAnalysisToDto(analysis: AnalysisResult): AnalysisResponseDto {
  return {
    id: analysis.id,
    sessionId: analysis.sessionId,
    insuranceType: analysis.insuranceType,
    score: analysis.score,
    scoreLabel: analysis.scoreLabel,
    insights: analysis.insights.map((insight) => mapInsightToDto(insight, true)),
    totalSavingsMin: analysis.totalSavings.min,
    totalSavingsMax: analysis.totalSavings.max,
    savingsBreakdown: analysis.savingsBreakdown.map((sb) => ({
      category: sb.category,
      min: sb.min,
      max: sb.max,
      description: sb.description,
    })),
    createdAt: new Date(analysis.createdAt).toISOString(),
  };
}

export function mapAnalysisToFreeDto(analysis: AnalysisResult): FreeAnalysisResponseDto {
  const freeInsights = analysis.insights.filter((i) => i.isFreeInsight);
  const lockedInsights = analysis.insights.filter((i) => !i.isFreeInsight);

  return {
    id: analysis.id,
    sessionId: analysis.sessionId,
    insuranceType: analysis.insuranceType,
    score: analysis.score,
    scoreLabel: analysis.scoreLabel,
    freeInsights: freeInsights.map((insight) => mapInsightToDto(insight, true)),
    lockedInsightsCount: lockedInsights.length,
    potentialSavingsMin: analysis.totalSavings.min,
    potentialSavingsMax: analysis.totalSavings.max,
    createdAt: new Date(analysis.createdAt).toISOString(),
  };
}

// Full DTO with all insights unlocked (for paid users)
export interface FullAnalysisResponseDto extends FreeAnalysisResponseDto {
  unlockedInsights: InsightDto[];
}

export function mapAnalysisToFullDto(analysis: AnalysisResult): FullAnalysisResponseDto {
  const freeInsights = analysis.insights.filter((i) => i.isFreeInsight);
  const paidInsights = analysis.insights.filter((i) => !i.isFreeInsight);

  return {
    id: analysis.id,
    sessionId: analysis.sessionId,
    insuranceType: analysis.insuranceType,
    score: analysis.score,
    scoreLabel: analysis.scoreLabel,
    freeInsights: freeInsights.map((insight) => mapInsightToDto(insight, true)),
    unlockedInsights: paidInsights.map((insight) => mapInsightToDto(insight, true)),
    lockedInsightsCount: 0, // All unlocked
    potentialSavingsMin: analysis.totalSavings.min,
    potentialSavingsMax: analysis.totalSavings.max,
    createdAt: new Date(analysis.createdAt).toISOString(),
  };
}

// ===== Factory for creating Insight entity from strategy result =====

export function createInsightFromStrategy(
  strategyId: string,
  category: InsightCategory,
  status: InsightStatus,
  priority: InsightPriority,
  content: InsightContent,
  savingsImpact: SavingsImpact | null,
  isFreeInsight: boolean
): Insight {
  return {
    id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    strategyId,
    category,
    status,
    priority,
    content,
    savingsImpact,
    isFreeInsight,
  };
}
