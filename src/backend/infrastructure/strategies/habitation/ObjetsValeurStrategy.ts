import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class ObjetsValeurStrategy implements IStrategy {
  id = "hab_objets_valeur";
  name = "Objets de valeur";
  category = "couverture" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.objets_valeur !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const hasObjetsValeur = answers.objets_valeur === true;

    if (hasObjetsValeur) {
      return {
        status: "DANGER",
        priority: "P2",
        insight: {
          title: "Objets de valeur à déclarer",
          description: "Tu possèdes des objets de valeur. Vérifie qu'ils sont correctement couverts.",
          fullDescription: "Les contrats standard plafonnent souvent les objets de valeur (bijoux, œuvres d'art, collections) à 1 500-3 000€. Si tes objets dépassent ce plafond, ils ne seront que partiellement remboursés. Déclare-les spécifiquement ou souscris une extension.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Pas d'objets de valeur particuliers",
        description: "Tu n'as pas déclaré d'objets de valeur spécifiques.",
        fullDescription: "Sans objets de valeur particuliers, le plafond standard de ton contrat devrait suffire pour couvrir tes biens.",
      },
      savingsImpact: null,
    };
  }
}
