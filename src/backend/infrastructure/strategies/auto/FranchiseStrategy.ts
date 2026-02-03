import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class FranchiseStrategy implements IStrategy {
  id = "auto_franchise";
  name = "Franchise";
  category = "tarif" as const;
  isFreeInsight = true;

  applies(answers: Record<string, unknown>): boolean {
    return answers.franchise !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const franchise = Number(answers.franchise) || 0;

    if (franchise > 500) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Franchise très élevée",
          description: `Ta franchise de ${franchise}€ est très élevée. En cas de sinistre, tu devras payer cette somme de ta poche.`,
          fullDescription: `Avec une franchise de ${franchise}€, même un petit accrochage te coûtera cher. Si tu n'as pas l'épargne pour absorber ce coût, renégocie ta franchise à la baisse (300€ max recommandé).`,
        },
        savingsImpact: null,
      };
    }

    if (franchise > 300) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Franchise élevée",
          description: `Ta franchise de ${franchise}€ est au-dessus de la moyenne.`,
          fullDescription: "Une franchise entre 300€ et 500€ permet de réduire ta prime mais représente un risque si tu as un sinistre. Assure-toi d'avoir cette somme disponible.",
        },
        savingsImpact: { min: 30, max: 80 },
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Franchise raisonnable",
        description: `Ta franchise de ${franchise}€ est bien calibrée.`,
        fullDescription: "Une franchise basse te protège mieux en cas de sinistre. Le surcoût de prime est généralement compensé par la tranquillité d'esprit.",
      },
      savingsImpact: null,
    };
  }
}
