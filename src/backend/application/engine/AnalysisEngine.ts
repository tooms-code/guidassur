import { IAnalysisEngine } from "@/backend/domain/interfaces/IAnalysisEngine";
import { IStrategyRegistry } from "@/backend/domain/interfaces/IStrategyRegistry";
import {
  AnalysisResult,
  calculateScoreLabel,
  SavingsBreakdown,
} from "@/backend/domain/entities/AnalysisResult";
import { Insight, InsightCategory } from "@/backend/domain/entities/Insight";
import { InsuranceType } from "@/shared/types/insurance";
import { generateId } from "@/backend/infrastructure/utils/id";

class AnalysisEngine implements IAnalysisEngine {
  constructor(private registry: IStrategyRegistry) {}

  analyze(
    sessionId: string,
    insuranceType: InsuranceType,
    answers: Record<string, unknown>,
    existingId?: string
  ): AnalysisResult {
    const strategies = this.registry.getStrategies(insuranceType);
    const insights: Insight[] = [];

    let totalPoints = 0;
    let maxPoints = 0;

    for (const strategy of strategies) {
      if (!strategy.applies(answers)) {
        continue;
      }

      const result = strategy.evaluate(answers);

      // Calculate points
      maxPoints += 2;
      if (result.status === "OK") {
        totalPoints += 2;
      } else if (result.status === "ATTENTION") {
        totalPoints += 1;
      }
      // DANGER = 0 points

      const insight: Insight = {
        id: generateId(),
        strategyId: strategy.id,
        category: strategy.category,
        status: result.status,
        priority: result.priority,
        content: result.insight,
        savingsImpact: result.savingsImpact,
        isFreeInsight: strategy.isFreeInsight,
      };

      insights.push(insight);
    }

    // Calculate score
    const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 100;
    const scoreLabel = calculateScoreLabel(score);

    // Sort insights by priority and status
    const sortedInsights = this.sortInsights(insights);

    // Calculate savings
    const { totalSavings, savingsBreakdown } = this.calculateSavings(sortedInsights);

    const analysisId = existingId || generateId();

    return {
      id: analysisId,
      sessionId,
      insuranceType,
      score,
      scoreLabel,
      insights: sortedInsights,
      totalSavings,
      savingsBreakdown,
      createdAt: Date.now(),
      isUnlocked: false,
    };
  }

  private sortInsights(insights: Insight[]): Insight[] {
    const priorityOrder = { P1: 0, P2: 1, P3: 2 };
    const statusOrder = { DANGER: 0, ATTENTION: 1, OK: 2 };

    return [...insights].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return statusOrder[a.status] - statusOrder[b.status];
    });
  }

  private calculateSavings(insights: Insight[]): {
    totalSavings: { min: number; max: number };
    savingsBreakdown: SavingsBreakdown[];
  } {
    const breakdownMap = new Map<InsightCategory, SavingsBreakdown>();

    let totalMin = 0;
    let totalMax = 0;

    for (const insight of insights) {
      if (!insight.savingsImpact) continue;

      totalMin += insight.savingsImpact.min;
      totalMax += insight.savingsImpact.max;

      const existing = breakdownMap.get(insight.category);
      if (existing) {
        existing.min += insight.savingsImpact.min;
        existing.max += insight.savingsImpact.max;
      } else {
        breakdownMap.set(insight.category, {
          category: insight.category,
          min: insight.savingsImpact.min,
          max: insight.savingsImpact.max,
          description: this.getCategoryDescription(insight.category),
        });
      }
    }

    return {
      totalSavings: { min: totalMin, max: totalMax },
      savingsBreakdown: Array.from(breakdownMap.values()),
    };
  }

  private getCategoryDescription(category: InsightCategory): string {
    const descriptions: Record<InsightCategory, string> = {
      tarif: "Optimisation tarifaire",
      garantie: "Ajustement des garanties",
      couverture: "Couverture adaptée",
      profil: "Adaptation au profil",
      risque: "Gestion des risques",
    };
    return descriptions[category];
  }
}

// Export class for injection - instance created in infrastructure/factories
export { AnalysisEngine };
