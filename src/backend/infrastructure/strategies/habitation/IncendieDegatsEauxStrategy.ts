import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class IncendieDegatsEauxStrategy implements IStrategy {
  id = "hab_incendie_degats_eaux";
  name = "Incendie et dégâts des eaux";
  category = "garantie" as const;
  isFreeInsight = true;

  applies(answers: Record<string, unknown>): boolean {
    return answers.options_garanties !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const garanties = (answers.options_garanties as string[]) || [];
    const hasIncendie = garanties.includes("incendie");
    const hasDegatsEaux = garanties.includes("degats_eaux");
    const statut = answers.statut_occupation as string;
    const isLocataire = ["locataire", "colocataire"].includes(statut);

    if ((!hasIncendie || !hasDegatsEaux) && isLocataire) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Garanties essentielles manquantes",
          description: "En tant que locataire, l'incendie et les dégâts des eaux sont indispensables.",
          fullDescription: "Ces garanties couvrent les sinistres les plus fréquents et les plus coûteux. En tant que locataire, tu es responsable vis-à-vis du propriétaire. Un dégât des eaux non couvert peut te coûter des milliers d'euros.",
        },
        savingsImpact: null,
      };
    }

    if (!hasIncendie || !hasDegatsEaux) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Couverture partielle incendie/dégâts des eaux",
          description: `Tu n'as pas la garantie ${!hasIncendie ? "incendie" : "dégâts des eaux"}.`,
          fullDescription: "Les dégâts des eaux sont le sinistre le plus fréquent en habitation. L'incendie est plus rare mais dévastateur. Ces deux garanties sont fortement recommandées.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Risques majeurs couverts",
        description: "Tu es protégé contre l'incendie et les dégâts des eaux.",
        fullDescription: "Ces deux garanties couvrent les sinistres les plus courants. Le dégât des eaux représente environ 50% des sinistres habitation. Tu es bien protégé.",
      },
      savingsImpact: null,
    };
  }
}
