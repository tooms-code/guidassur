import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class ResponsabiliteCivileStrategy implements IStrategy {
  id = "hab_responsabilite_civile";
  name = "Responsabilité civile";
  category = "garantie" as const;
  isFreeInsight = true;

  applies(answers: Record<string, unknown>): boolean {
    return answers.options_garanties !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const garanties = (answers.options_garanties as string[]) || [];
    const hasRC = garanties.includes("responsabilite_civile");

    if (!hasRC) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Responsabilité civile absente",
          description: "Tu n'as pas de responsabilité civile habitation. C'est obligatoire pour les locataires.",
          fullDescription: "La responsabilité civile couvre les dommages que tu pourrais causer à des tiers (dégât des eaux chez le voisin, incendie...). Sans elle, tu es personnellement responsable sur ton patrimoine. Cette garantie est obligatoire pour les locataires.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Responsabilité civile couverte",
        description: "Tu es protégé si tu causes des dommages à des tiers.",
        fullDescription: "Ta responsabilité civile habitation te protège en cas de dommages causés à autrui depuis ton logement. Vérifie le plafond de couverture (généralement 1 à 6 millions d'euros).",
      },
      savingsImpact: null,
    };
  }
}
