import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class OptiqueStrategy implements IStrategy {
  id = "mutuelle_optique";
  name = "Optique";
  category = "couverture" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.lunettes_lentilles !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const porteLunettes = answers.lunettes_lentilles === true;
    const garanties = (answers.options_garanties as string[]) || [];
    const hasOptiqueRenforce = garanties.includes("optique");

    if (!porteLunettes) {
      if (hasOptiqueRenforce) {
        return {
          status: "ATTENTION",
          priority: "P3",
          insight: {
            title: "Forfait optique renforcé inutilisé",
            description: "Tu paies pour un forfait optique renforcé mais tu ne portes pas de lunettes.",
            fullDescription: "Si tu n'as pas besoin de correction, ce forfait optique augmente ta cotisation inutilement. Une formule sans optique renforcée pourrait te faire économiser 30 à 80€/an.",
          },
          savingsImpact: { min: 30, max: 80 },
        };
      }
      return {
        status: "OK",
        priority: "P3",
        insight: {
          title: "Optique standard suffisant",
          description: "Tu ne portes pas de lunettes, un forfait minimal suffit.",
          fullDescription: "Sans besoin de correction, le forfait optique de base de ta mutuelle est adapté. Il te couvrira si un jour tu as besoin de lunettes.",
        },
        savingsImpact: null,
      };
    }

    if (porteLunettes && !hasOptiqueRenforce) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Optique insuffisant",
          description: "Tu portes des lunettes mais tu n'as pas de forfait optique renforcé.",
          fullDescription: "Les lunettes coûtent 200 à 600€ selon ta correction. Sans forfait optique renforcé, le remboursement de base (60-100€) laisse un reste à charge important. Passe à une formule avec optique renforcée.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Bonne couverture optique",
        description: "Tu as un forfait optique renforcé adapté à tes besoins.",
        fullDescription: "Avec un forfait optique renforcé, tu bénéficies d'un meilleur remboursement sur les verres et montures. Vérifie le montant exact dans ton contrat.",
      },
      savingsImpact: null,
    };
  }
}
