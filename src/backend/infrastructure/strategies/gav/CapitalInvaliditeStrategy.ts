import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class CapitalInvaliditeStrategy implements IStrategy {
  id = "gav_capital_invalidite";
  name = "Capital invalidité";
  category = "couverture" as const;
  isFreeInsight = true;

  applies(answers: Record<string, unknown>): boolean {
    return answers.capital_invalidite !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const capital = Number(answers.capital_invalidite) || 0;
    const hasChildren = answers.enfants_charge === true;

    if (capital < 500000) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Capital invalidité insuffisant",
          description: `Ton capital de ${capital.toLocaleString("fr-FR")}€ est trop bas pour une invalidité grave.`,
          fullDescription: `Un capital de ${capital.toLocaleString("fr-FR")}€ ne permettrait pas de compenser une perte de revenus en cas d'invalidité. Les experts recommandent un minimum de 1 000 000€ pour adapter son logement, véhicule, et maintenir son niveau de vie.`,
        },
        savingsImpact: null,
      };
    }

    if (capital < 1000000 && hasChildren) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Capital à renforcer avec des enfants",
          description: `Avec des enfants à charge, ton capital de ${capital.toLocaleString("fr-FR")}€ pourrait être insuffisant.`,
          fullDescription: "Avec des enfants à charge, un capital plus élevé est recommandé pour assurer leur sécurité financière en cas d'invalidité grave. Vise au moins 1 000 000€.",
        },
        savingsImpact: null,
      };
    }

    if (capital < 1000000) {
      return {
        status: "ATTENTION",
        priority: "P3",
        insight: {
          title: "Capital invalidité correct mais améliorable",
          description: `Ton capital de ${capital.toLocaleString("fr-FR")}€ est dans la moyenne.`,
          fullDescription: "Ce niveau de capital offre une protection de base. Pour une meilleure sécurité, envisage un capital de 1 000 000€ minimum.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Excellent capital invalidité",
        description: `Ton capital de ${capital.toLocaleString("fr-FR")}€ offre une très bonne protection.`,
        fullDescription: "Ce niveau de capital permet de faire face aux adaptations nécessaires en cas d'invalidité grave (logement, véhicule, aide à domicile).",
      },
      savingsImpact: null,
    };
  }
}
