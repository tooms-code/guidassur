import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class TauxMinimumStrategy implements IStrategy {
  id = "gav_taux_minimum";
  name = "Seuil d'intervention";
  category = "couverture" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.taux_minimum_invalidite !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const taux = Number(answers.taux_minimum_invalidite) || 0;

    if (taux >= 30) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Seuil d'intervention trop élevé",
          description: `Ton contrat n'intervient qu'à partir de ${taux}% d'invalidité. Beaucoup de sinistres ne seront pas couverts.`,
          fullDescription: `Avec un seuil de ${taux}%, tu ne seras indemnisé que pour des accidents très graves. Une entorse grave, une fracture avec séquelles, ou une perte de mobilité partielle resteraient sans indemnisation. Vise un seuil de 10% maximum.`,
        },
        savingsImpact: null,
      };
    }

    if (taux > 5) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Seuil d'intervention élevé",
          description: `Ton seuil de ${taux}% exclut les accidents mineurs à modérés.`,
          fullDescription: "Un seuil entre 5% et 30% est courant mais limite la protection. Les contrats les plus protecteurs interviennent dès 1% ou 5% d'invalidité.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Excellent seuil d'intervention",
        description: `Ton seuil de ${taux}% te protège dès les premières séquelles.`,
        fullDescription: "Avec un seuil bas, même les séquelles mineures d'un accident seront indemnisées. C'est la meilleure protection possible.",
      },
      savingsImpact: null,
    };
  }
}
