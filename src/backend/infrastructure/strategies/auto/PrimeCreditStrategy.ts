import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class PrimeCreditStrategy implements IStrategy {
  id = "auto_prime_credit";
  name = "Véhicule à crédit";
  category = "couverture" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.credit_auto !== undefined && answers.formule !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const hasCredit = answers.credit_auto === true;
    const formule = answers.formule as string;
    const isTousRisques = formule === "tous_risques";

    if (hasCredit && !isTousRisques) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Véhicule à crédit sans tous risques",
          description: "Ton véhicule est financé mais tu n'es pas en tous risques.",
          fullDescription: "L'organisme de crédit exige souvent une assurance tous risques. En cas de sinistre responsable, tu devrais continuer à rembourser un véhicule détruit sans indemnisation. Vérifie ton contrat de crédit.",
        },
        savingsImpact: null,
      };
    }

    if (hasCredit && isTousRisques) {
      return {
        status: "OK",
        priority: "P3",
        insight: {
          title: "Couverture adaptée au crédit",
          description: "Ton véhicule à crédit est bien couvert en tous risques.",
          fullDescription: "C'est la bonne approche. En cas de sinistre total, l'indemnisation permettra de solder le crédit. Vérifie que tu as une garantie valeur à neuf si ton véhicule est récent.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Véhicule sans crédit",
        description: "Ton véhicule n'est pas financé par un crédit.",
        fullDescription: "Sans contrainte de crédit, tu as plus de liberté sur le niveau de couverture. Adapte-le à la valeur actuelle de ton véhicule.",
      },
      savingsImpact: null,
    };
  }
}
