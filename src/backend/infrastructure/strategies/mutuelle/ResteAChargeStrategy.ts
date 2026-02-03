import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class ResteAChargeStrategy implements IStrategy {
  id = "mutuelle_reste_a_charge";
  name = "Reste à charge global";
  category = "tarif" as const;
  isFreeInsight = true;

  applies(answers: Record<string, unknown>): boolean {
    return answers.reste_a_charge !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const resteACharge = Number(answers.reste_a_charge) || 0;
    const primeAnnuelle = Number(answers.prime_annuelle) || 0;

    if (resteACharge > 500) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Reste à charge trop élevé",
          description: `Tu paies ${resteACharge}€ de reste à charge par an en plus de ta cotisation.`,
          fullDescription: `Avec ${resteACharge}€ de frais non remboursés, ta mutuelle ne remplit pas son rôle. Une meilleure couverture coûterait peut-être 10-20€/mois de plus mais réduirait drastiquement ces frais.`,
        },
        savingsImpact: { min: 200, max: 400 },
      };
    }

    if (resteACharge > 200) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Reste à charge modéré",
          description: `Tu as environ ${resteACharge}€ de frais non remboursés par an.`,
          fullDescription: `Un reste à charge de ${resteACharge}€ est dans la moyenne mais peut être optimisé. Compare avec des mutuelles offrant de meilleurs remboursements sur les postes où tu dépenses le plus.`,
        },
        savingsImpact: { min: 50, max: 150 },
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Bon niveau de remboursement",
        description: `Ton reste à charge de ${resteACharge}€ est faible.`,
        fullDescription: `Avec seulement ${resteACharge}€ de frais non remboursés par an, ta mutuelle est efficace. Vérifie tout de même que tu n'es pas sur-assuré : ${primeAnnuelle > 0 ? `ta cotisation de ${primeAnnuelle}€/an est-elle justifiée ?` : "compare ta cotisation au marché."}`,
      },
      savingsImpact: null,
    };
  }
}
