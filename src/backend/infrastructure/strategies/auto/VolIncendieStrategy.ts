import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class VolIncendieStrategy implements IStrategy {
  id = "auto_vol_incendie";
  name = "Vol et incendie";
  category = "couverture" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.options_garanties !== undefined && answers.lieu_stationnement !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const garanties = (answers.options_garanties as string[]) || [];
    const hasVol = garanties.includes("vol");
    const hasIncendie = garanties.includes("incendie");
    const stationnement = answers.lieu_stationnement as string;
    const isExposed = stationnement === "voie_publique" || stationnement === "parking_exterieur";
    const anneeCirculation = Number(answers.annee_circulation) || 2015;
    const vehiculeRecent = anneeCirculation >= 2018;

    if (!hasVol && isExposed && vehiculeRecent) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Véhicule exposé sans garantie vol",
          description: "Tu stationnes en extérieur sans garantie vol sur un véhicule récent.",
          fullDescription: "Stationner en voie publique ou parking extérieur augmente fortement le risque de vol. Sur un véhicule de moins de 5 ans, la garantie vol est fortement recommandée.",
        },
        savingsImpact: null,
      };
    }

    if (!hasVol && isExposed) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Stationnement exposé sans vol",
          description: "Tu stationnes en extérieur sans garantie vol.",
          fullDescription: "Le stationnement en extérieur augmente le risque de vol et de dégradations. Évalue si la garantie vol vaut le coût supplémentaire selon la valeur de ton véhicule.",
        },
        savingsImpact: null,
      };
    }

    if (hasVol && hasIncendie) {
      return {
        status: "OK",
        priority: "P3",
        insight: {
          title: "Bonne protection vol et incendie",
          description: "Tu es couvert contre le vol et l'incendie.",
          fullDescription: "Ces garanties te protègent contre les sinistres majeurs. Vérifie les conditions (franchise, valeur de remplacement) dans ton contrat.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Protection partielle vol/incendie",
        description: hasVol ? "Tu as la garantie vol." : hasIncendie ? "Tu as la garantie incendie." : "Pas de garantie vol ni incendie.",
        fullDescription: "Selon la valeur et l'âge de ton véhicule, l'absence de ces garanties peut être un choix économique pertinent.",
      },
      savingsImpact: null,
    };
  }
}
