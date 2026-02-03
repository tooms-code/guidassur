import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class VolStrategy implements IStrategy {
  id = "hab_vol";
  name = "Garantie vol";
  category = "garantie" as const;
  isFreeInsight = true;

  applies(answers: Record<string, unknown>): boolean {
    return answers.options_garanties !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const garanties = (answers.options_garanties as string[]) || [];
    const hasVol = garanties.includes("vol");
    const typeLogement = answers.type_logement as string;
    const etage = answers.etage as string;
    const securite = answers.systeme_securite as string;

    const isExposed = typeLogement === "maison" || etage === "rdc";
    const hasSecurite = ["alarme", "camera"].includes(securite);

    if (!hasVol && isExposed && securite === "aucun") {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Risque vol élevé non couvert",
          description: "Tu es en RDC ou maison sans sécurité et sans garantie vol. Risque important.",
          fullDescription: "Les logements en rez-de-chaussée et les maisons sont les plus cambriolés. Sans alarme ni garantie vol, tu n'as aucune protection. Un cambriolage moyen coûte 3 000 à 6 000€ de préjudice.",
        },
        savingsImpact: null,
      };
    }

    if (!hasVol && isExposed && hasSecurite) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Garantie vol recommandée",
          description: "Tu as un système de sécurité mais pas de garantie vol. Le risque reste réel.",
          fullDescription: "Ton système de sécurité dissuade les cambrioleurs mais ne les arrête pas tous. La garantie vol complète ta protection et peut même coûter moins cher grâce à ton équipement.",
        },
        savingsImpact: null,
      };
    }

    if (!hasVol) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Pas de garantie vol",
          description: "Tu n'es pas couvert en cas de cambriolage.",
          fullDescription: "Même en appartement en étage, le risque de vol existe. Évalue la valeur de tes biens et décide si tu peux assumer une perte totale.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Garantie vol souscrite",
        description: "Tu es protégé en cas de cambriolage.",
        fullDescription: "Ta garantie vol couvre tes biens en cas d'effraction. Vérifie les conditions (preuves d'effraction requises) et le plafond de remboursement.",
      },
      savingsImpact: null,
    };
  }
}
