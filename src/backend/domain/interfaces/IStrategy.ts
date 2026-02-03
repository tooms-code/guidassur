import {
  InsightStatus,
  InsightPriority,
  InsightCategory,
  InsightContent,
  SavingsImpact,
} from "@/backend/domain/entities/Insight";

export interface StrategyResult {
  status: InsightStatus;
  priority: InsightPriority;
  insight: InsightContent;
  savingsImpact: SavingsImpact | null;
}

export interface IStrategy {
  id: string;
  name: string;
  category: InsightCategory;
  isFreeInsight: boolean;

  applies(answers: Record<string, unknown>): boolean;
  evaluate(answers: Record<string, unknown>): StrategyResult;
}
