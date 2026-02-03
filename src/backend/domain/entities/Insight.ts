export type InsightStatus = "OK" | "ATTENTION" | "DANGER";
export type InsightPriority = "P1" | "P2" | "P3";
export type InsightCategory = "tarif" | "garantie" | "couverture" | "profil" | "risque";

export interface InsightContent {
  title: string;
  description: string;
  fullDescription: string;
}

export interface SavingsImpact {
  min: number;
  max: number;
}

export interface Insight {
  id: string;
  strategyId: string;
  category: InsightCategory;
  status: InsightStatus;
  priority: InsightPriority;
  content: InsightContent;
  savingsImpact: SavingsImpact | null;
  isFreeInsight: boolean;
}
