import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class DentaireStrategy implements IStrategy {
  id = "mutuelle_dentaire";
  name = "Dentaire";
  category = "couverture" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.soins_dentaires !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const soinsPrevus = answers.soins_dentaires === true;
    const garanties = (answers.options_garanties as string[]) || [];
    const hasDentaireRenforce = garanties.includes("dentaire");

    if (soinsPrevus && !hasDentaireRenforce) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Soins dentaires mal couverts",
          description: "Tu prévois des soins dentaires importants mais tu n'as pas de garantie dentaire renforcée.",
          fullDescription: "Les couronnes coûtent 500-1200€, les implants 1500-2500€. Sans garantie dentaire renforcée, le remboursement de base laisse 50-80% à ta charge. Renforce ta couverture avant les soins.",
        },
        savingsImpact: null,
      };
    }

    if (!soinsPrevus && hasDentaireRenforce) {
      return {
        status: "ATTENTION",
        priority: "P3",
        insight: {
          title: "Garantie dentaire peut-être surdimensionnée",
          description: "Tu n'as pas de soins dentaires prévus mais tu paies pour une garantie dentaire renforcée.",
          fullDescription: "Si tu n'as pas de soins dentaires importants à prévoir, une formule avec garantie dentaire standard pourrait suffire et te faire économiser. Garde toutefois une marge si des soins imprévus surviennent.",
        },
        savingsImpact: { min: 20, max: 60 },
      };
    }

    if (soinsPrevus && hasDentaireRenforce) {
      return {
        status: "OK",
        priority: "P3",
        insight: {
          title: "Bonne couverture dentaire",
          description: "Ta mutuelle offre une bonne prise en charge pour tes soins dentaires prévus.",
          fullDescription: "Avec une garantie dentaire renforcée, tu bénéficieras d'un meilleur remboursement sur les prothèses et soins importants. Vérifie les plafonds annuels dans ton contrat.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Couverture dentaire adaptée",
        description: "Pas de soins dentaires importants prévus, ta couverture standard suffit.",
        fullDescription: "Pour les soins dentaires courants (détartrage, caries), le remboursement de base est généralement suffisant. Si des soins importants surviennent, compare les offres avant de te lancer.",
      },
      savingsImpact: null,
    };
  }
}
