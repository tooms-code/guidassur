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
import { generateId } from "@/backend/infrastructure/utils/id";

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

// Single response DTO - API filters insights based on isUnlocked
export interface AnalysisPublicDto {
  id: string;
  sessionId: string;
  insuranceType: InsuranceType;
  isSaved: boolean;
  isUnlocked: boolean;
  score: number;
  scoreLabel: ScoreLabel;
  insights: InsightDto[];  // Only visible insights (filtered by API)
  lockedCount: number;     // Number of locked insights (0 if unlocked)
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

// Single mapper - filters insights based on isUnlocked status
export function mapAnalysisToPublicDto(analysis: AnalysisResult): AnalysisPublicDto {
  const visibleInsights = analysis.isUnlocked
    ? analysis.insights
    : analysis.insights.filter((i) => i.isFreeInsight);

  const lockedCount = analysis.isUnlocked
    ? 0
    : analysis.insights.filter((i) => !i.isFreeInsight).length;

  return {
    id: analysis.id,
    sessionId: analysis.sessionId,
    insuranceType: analysis.insuranceType,
    isSaved: !!analysis.userId,
    isUnlocked: analysis.isUnlocked,
    score: analysis.score,
    scoreLabel: analysis.scoreLabel,
    // showFull = true only when analysis is unlocked (paid content)
    insights: visibleInsights.map((insight) => mapInsightToDto(insight, analysis.isUnlocked)),
    lockedCount,
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
    id: generateId(),
    strategyId,
    category,
    status,
    priority,
    content,
    savingsImpact,
    isFreeInsight,
  };
}
