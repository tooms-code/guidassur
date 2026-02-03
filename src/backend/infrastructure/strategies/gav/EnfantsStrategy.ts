import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class EnfantsStrategy implements IStrategy {
  id = "gav_enfants";
  name = "Protection des enfants";
  category = "couverture" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.enfants_charge !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const hasChildren = answers.enfants_charge === true;
    const capital = Number(answers.capital_invalidite) || 0;

    if (!hasChildren) {
      return {
        status: "OK",
        priority: "P3",
        insight: {
          title: "Pas d'enfants à charge",
          description: "Tu n'as pas déclaré d'enfants à charge.",
          fullDescription: "Sans enfants à charge, ta couverture GAV actuelle peut se concentrer sur ta propre protection. Pense à mettre à jour ton contrat si ta situation familiale évolue.",
        },
        savingsImpact: null,
      };
    }

    // Has children
    if (capital < 1000000) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Protection enfants à renforcer",
          description: "Tu as des enfants à charge mais ton capital invalidité est limité.",
          fullDescription: "Avec des enfants à charge, vérifie que ton contrat GAV les couvre également. Un capital plus élevé (1 000 000€+) est recommandé pour assurer leur avenir en cas d'accident grave te concernant.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Bonne protection familiale",
        description: "Tu as des enfants et un capital adapté pour les protéger.",
        fullDescription: "Ton capital invalidité est suffisant pour assurer la sécurité de tes enfants. Vérifie que ton contrat GAV les couvre directement aussi pour leurs propres accidents.",
      },
      savingsImpact: null,
    };
  }
}
