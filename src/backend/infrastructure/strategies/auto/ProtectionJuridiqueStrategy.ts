import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class ProtectionJuridiqueStrategy implements IStrategy {
  id = "auto_protection_juridique";
  name = "Protection juridique";
  category = "couverture" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.options_garanties !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const garanties = (answers.options_garanties as string[]) || [];
    const hasProtectionJuridique = garanties.includes("protection_juridique");

    if (!hasProtectionJuridique) {
      return {
        status: "ATTENTION",
        priority: "P3",
        insight: {
          title: "Pas de protection juridique",
          description: "Tu n'as pas de protection juridique auto.",
          fullDescription: "La protection juridique t'aide en cas de litige (accident avec désaccord sur les responsabilités, problème avec un garagiste...). Elle coûte 20-40€/an et peut éviter des frais d'avocat importants.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Protection juridique incluse",
        description: "Tu bénéficies d'une protection juridique.",
        fullDescription: "En cas de litige lié à ton véhicule, tu as accès à des conseils juridiques et une prise en charge des frais de procédure. C'est une sécurité appréciable.",
      },
      savingsImpact: null,
    };
  }
}
