import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class PrixAgeStrategy implements IStrategy {
  id = "mutuelle_prix_age";
  name = "Cohérence prix/âge";
  category = "tarif" as const;
  isFreeInsight = true;

  applies(answers: Record<string, unknown>): boolean {
    return answers.prime_annuelle !== undefined && answers.age !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const primeAnnuelle = Number(answers.prime_annuelle) || 0;
    const age = Number(answers.age) || 0;

    // Définition des fourchettes de prix normales par tranche d'âge
    let expectedMin: number;
    let expectedMax: number;
    let ageGroup: string;

    if (age >= 18 && age <= 30) {
      // Jeunes adultes
      expectedMin = 500;
      expectedMax = 1200;
      ageGroup = "jeune adulte";
    } else if (age >= 31 && age <= 50) {
      // Adultes
      expectedMin = 1000;
      expectedMax = 1800;
      ageGroup = "adulte";
    } else if (age >= 51 && age <= 70) {
      // Seniors
      expectedMin = 1500;
      expectedMax = 3000;
      ageGroup = "senior";
    } else {
      // 70+
      expectedMin = 2000;
      expectedMax = 4000;
      ageGroup = "senior confirmé";
    }

    // Calcul de l'écart par rapport à la fourchette attendue
    const moyenneAttendue = (expectedMin + expectedMax) / 2;
    const ecartPourcentage = ((primeAnnuelle - moyenneAttendue) / moyenneAttendue) * 100;

    // Prix trop élevé pour l'âge
    if (primeAnnuelle > expectedMax * 1.3) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Prix anormalement élevé pour ton âge",
          description: `Tu paies ${primeAnnuelle.toLocaleString("fr-FR")}€/an, ce qui est très élevé pour un ${ageGroup}.`,
          fullDescription: `Pour ton âge (${age} ans), une mutuelle coûte généralement entre ${expectedMin.toLocaleString("fr-FR")}€ et ${expectedMax.toLocaleString("fr-FR")}€/an. Tu paies ${Math.round(ecartPourcentage)}% de plus que la moyenne. Vérifie que ton niveau de garanties justifie ce prix ou compare avec d'autres offres du marché.`,
        },
        savingsImpact: { min: primeAnnuelle - expectedMax, max: primeAnnuelle - expectedMin },
      };
    }

    // Prix élevé mais acceptable
    if (primeAnnuelle > expectedMax) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Prix élevé pour ton âge",
          description: `Ta cotisation de ${primeAnnuelle.toLocaleString("fr-FR")}€/an est au-dessus de la moyenne pour un ${ageGroup}.`,
          fullDescription: `Pour ton âge (${age} ans), une mutuelle coûte généralement entre ${expectedMin.toLocaleString("fr-FR")}€ et ${expectedMax.toLocaleString("fr-FR")}€/an. Vérifie que ton niveau de garanties justifie ce surcoût de ${Math.round(primeAnnuelle - expectedMax)}€/an.`,
        },
        savingsImpact: { min: Math.round((primeAnnuelle - expectedMax) * 0.3), max: Math.round(primeAnnuelle - expectedMax) },
      };
    }

    // Prix suspect car trop bas
    if (primeAnnuelle < expectedMin * 0.7) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Prix très bas : garanties limitées ?",
          description: `Ta cotisation de ${primeAnnuelle.toLocaleString("fr-FR")}€/an est très basse pour un ${ageGroup}.`,
          fullDescription: `Pour ton âge (${age} ans), une mutuelle coûte généralement entre ${expectedMin.toLocaleString("fr-FR")}€ et ${expectedMax.toLocaleString("fr-FR")}€/an. Un prix aussi bas peut signifier des garanties très limitées ou des plafonds de remboursement faibles. Vérifie ta couverture.`,
        },
        savingsImpact: null,
      };
    }

    // Prix légèrement bas mais acceptable
    if (primeAnnuelle < expectedMin) {
      return {
        status: "OK",
        priority: "P3",
        insight: {
          title: "Bon prix pour ton âge",
          description: `Ta cotisation de ${primeAnnuelle.toLocaleString("fr-FR")}€/an est économique pour un ${ageGroup}.`,
          fullDescription: `Tu paies moins que la moyenne (${expectedMin.toLocaleString("fr-FR")}-${expectedMax.toLocaleString("fr-FR")}€/an pour ton âge). Vérifie tout de même que tes garanties couvrent bien tes besoins essentiels.`,
        },
        savingsImpact: null,
      };
    }

    // Prix dans la fourchette normale
    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Prix cohérent avec ton âge",
        description: `Ta cotisation de ${primeAnnuelle.toLocaleString("fr-FR")}€/an est dans la moyenne pour un ${ageGroup}.`,
        fullDescription: `Pour ton âge (${age} ans), une mutuelle coûte généralement entre ${expectedMin.toLocaleString("fr-FR")}€ et ${expectedMax.toLocaleString("fr-FR")}€/an. Ton tarif est cohérent avec le marché.`,
      },
      savingsImpact: null,
    };
  }
}
