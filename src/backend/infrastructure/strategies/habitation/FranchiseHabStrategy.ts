import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class FranchiseHabStrategy implements IStrategy {
  id = "hab_franchise";
  name = "Franchise habitation";
  category = "tarif" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.franchise !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const franchise = Number(answers.franchise) || 0;

    if (franchise > 300) {
      return {
        status: "DANGER",
        priority: "P2",
        insight: {
          title: "Franchise trop élevée",
          description: `Ta franchise de ${franchise}€ est élevée. Les petits sinistres ne seront pas couverts.`,
          fullDescription: `Avec une franchise de ${franchise}€, un dégât des eaux mineur (fuite, infiltration) restera à ta charge. En habitation, une franchise de 150€ maximum est recommandée car les sinistres sont fréquents.`,
        },
        savingsImpact: null,
      };
    }

    if (franchise >= 150) {
      return {
        status: "ATTENTION",
        priority: "P3",
        insight: {
          title: "Franchise modérée",
          description: `Ta franchise de ${franchise}€ est dans la moyenne.`,
          fullDescription: "Une franchise entre 150€ et 300€ est acceptable mais limite les petits remboursements. Compare avec des offres à franchise réduite.",
        },
        savingsImpact: { min: 10, max: 30 },
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Franchise bien calibrée",
        description: `Ta franchise de ${franchise}€ te permet d'être bien indemnisé.`,
        fullDescription: "Avec une franchise basse, même les petits sinistres seront pris en charge. C'est particulièrement important pour les dégâts des eaux, très fréquents.",
      },
      savingsImpact: null,
    };
  }
}
