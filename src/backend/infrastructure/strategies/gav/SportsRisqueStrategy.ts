import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class SportsRisqueStrategy implements IStrategy {
  id = "gav_sports_risque";
  name = "Sports à risque";
  category = "risque" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.sports_risque !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const practicesSports = answers.sports_risque === true;

    if (practicesSports) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Sports à risque : vérifie ta couverture",
          description: "Tu pratiques des sports à risque. Sont-ils couverts par ta GAV ?",
          fullDescription: "Les sports à risque (ski, VTT, escalade, sports de combat, équitation, plongée...) sont souvent exclus des contrats GAV standard. Vérifie les conditions de ton contrat ou souscris une extension spécifique pour être couvert pendant ces activités.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Pas de sport à risque déclaré",
        description: "Tu ne pratiques pas de sport à risque.",
        fullDescription: "Sans sport à risque, les exclusions classiques des contrats GAV ne te concernent pas. Tu es couvert pour les accidents de la vie quotidienne.",
      },
      savingsImpact: null,
    };
  }
}
