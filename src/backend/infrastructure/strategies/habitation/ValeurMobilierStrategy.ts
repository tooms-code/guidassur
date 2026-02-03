import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class ValeurMobilierStrategy implements IStrategy {
  id = "hab_valeur_mobilier";
  name = "Cohérence valeur mobilier / vol";
  category = "couverture" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.valeur_mobilier !== undefined && answers.options_garanties !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const valeur = answers.valeur_mobilier as string;
    const garanties = (answers.options_garanties as string[]) || [];
    const hasVol = garanties.includes("vol");

    if (valeur === "plus_10k" && !hasVol) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Mobilier de valeur non protégé",
          description: "Tu as plus de 10 000€ de mobilier sans garantie vol. Risque financier important.",
          fullDescription: "Avec une valeur de mobilier supérieure à 10 000€, un cambriolage aurait un impact financier majeur. La garantie vol est fortement recommandée pour protéger cet investissement.",
        },
        savingsImpact: null,
      };
    }

    if (valeur === "3k_10k" && !hasVol) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Mobilier moyennement protégé",
          description: "Tu as 3 000 à 10 000€ de mobilier sans garantie vol.",
          fullDescription: "Cette valeur de mobilier justifie une garantie vol. Évalue si tu pourrais remplacer l'ensemble de tes meubles et appareils en cas de cambriolage.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Couverture adaptée au mobilier",
        description: "La protection de ton mobilier est cohérente avec sa valeur.",
        fullDescription: "Ta couverture semble adaptée à la valeur de ton mobilier. Pense à actualiser cette valeur en cas d'achat important.",
      },
      savingsImpact: null,
    };
  }
}
