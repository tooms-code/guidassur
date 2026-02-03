import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class VehiculeRemplacementStrategy implements IStrategy {
  id = "auto_vehicule_remplacement";
  name = "Véhicule de remplacement";
  category = "couverture" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.options_garanties !== undefined && answers.usage_vehicule !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const garanties = (answers.options_garanties as string[]) || [];
    const hasRemplacement = garanties.includes("vehicule_remplacement");
    const usage = answers.usage_vehicule as string;
    const besoinQuotidien = usage === "domicile_travail" || usage === "quotidien_intensif";

    if (!hasRemplacement && besoinQuotidien) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Pas de véhicule de remplacement",
          description: "Tu utilises ton véhicule au quotidien mais n'as pas de véhicule de remplacement prévu.",
          fullDescription: "Sans véhicule de remplacement, une immobilisation de plusieurs jours (réparation après sinistre) peut être très contraignante. Une location coûte 30-50€/jour.",
        },
        savingsImpact: null,
      };
    }

    if (hasRemplacement) {
      return {
        status: "OK",
        priority: "P3",
        insight: {
          title: "Véhicule de remplacement inclus",
          description: "Tu bénéficies d'un véhicule de remplacement en cas de sinistre.",
          fullDescription: "Cette garantie te permet de continuer tes déplacements pendant la réparation de ton véhicule. Vérifie la durée maximale et la catégorie du véhicule prêté.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Véhicule de remplacement non souscrit",
        description: "Tu n'as pas la garantie véhicule de remplacement.",
        fullDescription: "Pour un usage occasionnel ou si tu as une solution de repli (transports, 2ème véhicule), ne pas souscrire cette garantie peut être un choix pertinent.",
      },
      savingsImpact: null,
    };
  }
}
