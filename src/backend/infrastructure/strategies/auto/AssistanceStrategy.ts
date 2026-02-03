import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class AssistanceStrategy implements IStrategy {
  id = "auto_assistance";
  name = "Assistance";
  category = "couverture" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.options_garanties !== undefined && answers.usage_vehicule !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const garanties = (answers.options_garanties as string[]) || [];
    const hasAssistance0km = garanties.includes("assistance_0km");
    const usage = answers.usage_vehicule as string;
    const usageIntensif = usage === "domicile_travail" || usage === "longs_trajets" || usage === "quotidien_intensif";

    if (!hasAssistance0km && usageIntensif) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Pas d'assistance 0km",
          description: "Tu utilises beaucoup ton véhicule mais n'as pas l'assistance 0km.",
          fullDescription: "L'assistance 0km te dépanne même devant chez toi. Avec un usage quotidien, c'est rassurant. Sans elle, une panne à domicile = dépanneuse à tes frais (80-150€).",
        },
        savingsImpact: null,
      };
    }

    if (hasAssistance0km) {
      return {
        status: "OK",
        priority: "P3",
        insight: {
          title: "Assistance 0km incluse",
          description: "Tu bénéficies de l'assistance même à domicile.",
          fullDescription: "L'assistance 0km est un vrai plus. En cas de panne batterie, crevaison ou problème mécanique, tu es dépanné où que tu sois, sans frais supplémentaires.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Assistance classique",
        description: "Tu as probablement une assistance de base (hors 0km).",
        fullDescription: "L'assistance de base intervient généralement à partir de 25-50km de ton domicile. Pour un usage occasionnel, c'est souvent suffisant.",
      },
      savingsImpact: null,
    };
  }
}
