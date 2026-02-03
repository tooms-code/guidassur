import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class DepassementsStrategy implements IStrategy {
  id = "mutuelle_depassements";
  name = "Dépassements d'honoraires";
  category = "couverture" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.consultations_specialistes !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const consulteSpecialistes = answers.consultations_specialistes === true;
    const garanties = (answers.options_garanties as string[]) || [];
    const hasDepassements = garanties.includes("depassements");

    if (!consulteSpecialistes) {
      if (hasDepassements) {
        return {
          status: "ATTENTION",
          priority: "P3",
          insight: {
            title: "Garantie dépassements peut-être inutile",
            description: "Tu ne consultes pas fréquemment de spécialistes mais tu paies pour les dépassements.",
            fullDescription: "Si tu consultes rarement des spécialistes en secteur 2, cette garantie augmente ta cotisation sans réel bénéfice. Une formule sans couverture dépassements renforcée pourrait suffire.",
          },
          savingsImpact: { min: 30, max: 80 },
        };
      }
      return {
        status: "OK",
        priority: "P3",
        insight: {
          title: "Peu concerné par les dépassements",
          description: "Tu ne consultes pas fréquemment de spécialistes.",
          fullDescription: "Sans consultation fréquente de spécialistes pratiquant des dépassements d'honoraires, cette garantie est moins prioritaire pour toi.",
        },
        savingsImpact: null,
      };
    }

    if (consulteSpecialistes && !hasDepassements) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Dépassements non couverts",
          description: "Tu consultes fréquemment des spécialistes mais tes dépassements ne sont pas couverts.",
          fullDescription: "Les dépassements d'honoraires peuvent atteindre 50-150€ par consultation chez certains spécialistes (dermato, ophtalmo, psy...). Sans couverture, ces frais s'accumulent rapidement. Une garantie dépassements réduirait significativement ton reste à charge.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Bonne couverture des dépassements",
        description: "Tu consultes des spécialistes et tu es couvert pour les dépassements.",
        fullDescription: "Ta garantie dépassements d'honoraires limite ton reste à charge chez les spécialistes en secteur 2. Tu peux consulter sereinement dermatologue, ophtalmo ou autres spécialistes.",
      },
      savingsImpact: null,
    };
  }
}
