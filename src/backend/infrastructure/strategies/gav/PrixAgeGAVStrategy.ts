import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class PrixAgeGAVStrategy implements IStrategy {
  id = "gav_prix_age";
  name = "Cohérence prix/âge GAV";
  category = "tarif" as const;
  isFreeInsight = true;

  applies(answers: Record<string, unknown>): boolean {
    return answers.prime_annuelle !== undefined && answers.age_assure !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const primeAnnuelle = Number(answers.prime_annuelle) || 0;
    const age = Number(answers.age_assure) || 0;
    const hasEnfants = answers.enfants_charge === true;
    const sportsRisque = answers.sports_risque === true;

    // Prix de base selon l'âge
    let prixBase = 100;
    if (age < 30) {
      prixBase = 80; // Jeunes : moins cher
    } else if (age < 50) {
      prixBase = 100; // Adultes : tarif normal
    } else if (age < 65) {
      prixBase = 120; // Seniors : légère augmentation
    } else {
      prixBase = 150; // Seniors+ : augmentation importante
    }

    // Ajustements
    let coeffMulti = 1;
    if (hasEnfants) {
      coeffMulti *= 1.5; // Avec enfants : couverture famille
    }
    if (sportsRisque) {
      coeffMulti *= 1.3; // Sports à risque : surprime
    }

    const expectedMin = prixBase * coeffMulti * 0.6;
    const expectedMax = prixBase * coeffMulti * 1.8;

    // Description du profil
    const getProfilDescription = () => {
      const parts = [`${age} ans`];
      if (hasEnfants) parts.push("avec enfants");
      if (sportsRisque) parts.push("sports à risque");
      return parts.join(", ");
    };

    const profilDesc = getProfilDescription();

    // Prix très élevé
    if (primeAnnuelle > expectedMax * 1.5) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Prix anormalement élevé",
          description: `Tu paies ${primeAnnuelle.toLocaleString("fr-FR")}€/an, c'est beaucoup trop pour une GAV.`,
          fullDescription: `Pour ton profil (${profilDesc}), une GAV coûte généralement entre ${Math.round(expectedMin).toLocaleString("fr-FR")}€ et ${Math.round(expectedMax).toLocaleString("fr-FR")}€/an. Tu paies ${Math.round(((primeAnnuelle - expectedMax) / expectedMax) * 100)}% de plus que la fourchette haute. Compare avec d'autres assureurs.`,
        },
        savingsImpact: { min: Math.round(primeAnnuelle - expectedMax), max: Math.round(primeAnnuelle - expectedMin) },
      };
    }

    // Prix élevé
    if (primeAnnuelle > expectedMax) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Prix élevé pour une GAV",
          description: `Ta cotisation de ${primeAnnuelle.toLocaleString("fr-FR")}€/an est au-dessus de la moyenne.`,
          fullDescription: `Pour ton profil (${profilDesc}), une GAV coûte généralement entre ${Math.round(expectedMin).toLocaleString("fr-FR")}€ et ${Math.round(expectedMax).toLocaleString("fr-FR")}€/an. Vérifie que ton capital invalidité élevé justifie ce surcoût.`,
        },
        savingsImpact: { min: Math.round((primeAnnuelle - expectedMax) * 0.3), max: Math.round(primeAnnuelle - expectedMax) },
      };
    }

    // Prix très bas
    if (primeAnnuelle < expectedMin * 0.5) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Prix très bas : couverture limitée ?",
          description: `Ta cotisation de ${primeAnnuelle.toLocaleString("fr-FR")}€/an est très basse.`,
          fullDescription: `Pour ton profil (${profilDesc}), une GAV coûte généralement entre ${Math.round(expectedMin).toLocaleString("fr-FR")}€ et ${Math.round(expectedMax).toLocaleString("fr-FR")}€/an. Un prix aussi bas peut signifier un capital invalidité faible ou un seuil d'intervention élevé.`,
        },
        savingsImpact: null,
      };
    }

    // Prix normal
    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Prix cohérent pour une GAV",
        description: `Ta cotisation de ${primeAnnuelle.toLocaleString("fr-FR")}€/an est dans la moyenne.`,
        fullDescription: `Pour ton profil (${profilDesc}), une GAV coûte généralement entre ${Math.round(expectedMin).toLocaleString("fr-FR")}€ et ${Math.round(expectedMax).toLocaleString("fr-FR")}€/an. Ton tarif est cohérent avec le marché.`,
      },
      savingsImpact: null,
    };
  }
}
