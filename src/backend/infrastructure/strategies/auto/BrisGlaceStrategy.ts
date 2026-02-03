import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class BrisGlaceStrategy implements IStrategy {
  id = "auto_bris_glace";
  name = "Bris de glace";
  category = "couverture" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.options_garanties !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const garanties = (answers.options_garanties as string[]) || [];
    const hasBrisGlace = garanties.includes("bris_glace");
    const franchiseBrisGlace = Number(answers.franchise_bris_glace) || 0;
    const anneeCirculation = Number(answers.annee_circulation) || 2020;
    const vehiculeRecent = anneeCirculation >= 2020;

    if (!hasBrisGlace && vehiculeRecent) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Bris de glace non couvert",
          description: "Tu n'as pas la garantie bris de glace sur un véhicule récent.",
          fullDescription: "Un pare-brise sur véhicule récent coûte 500-1500€ (plus avec caméra/capteurs). La garantie bris de glace coûte environ 30-50€/an. C'est souvent rentable.",
        },
        savingsImpact: null,
      };
    }

    if (hasBrisGlace && franchiseBrisGlace > 100) {
      return {
        status: "ATTENTION",
        priority: "P3",
        insight: {
          title: "Franchise bris de glace élevée",
          description: `Ta franchise bris de glace de ${franchiseBrisGlace}€ réduit l'intérêt de cette garantie.`,
          fullDescription: "Une réparation d'impact coûte souvent moins de 100€. Avec cette franchise, tu ne seras remboursé que pour un remplacement complet. Négocie une franchise à 0€.",
        },
        savingsImpact: { min: 20, max: 50 },
      };
    }

    if (hasBrisGlace) {
      return {
        status: "OK",
        priority: "P3",
        insight: {
          title: "Bris de glace couvert",
          description: "Tu es bien protégé contre le bris de glace.",
          fullDescription: "Bonne garantie à avoir. En cas d'impact, fais réparer rapidement pour éviter que ça se propage en fissure nécessitant un remplacement complet.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Bris de glace non souscrit",
        description: "Tu n'as pas la garantie bris de glace, ce qui peut être un choix cohérent sur un véhicule ancien.",
        fullDescription: "Sur un véhicule de plus de 5 ans, le coût d'un pare-brise est plus faible. Ne pas souscrire cette garantie peut être économiquement justifié.",
      },
      savingsImpact: null,
    };
  }
}
