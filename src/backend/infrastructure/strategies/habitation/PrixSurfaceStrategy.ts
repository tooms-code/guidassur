import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class PrixSurfaceStrategy implements IStrategy {
  id = "hab_prix_surface";
  name = "Cohérence prix/surface/logement";
  category = "tarif" as const;
  isFreeInsight = true;

  applies(answers: Record<string, unknown>): boolean {
    return (
      answers.prime_annuelle !== undefined &&
      answers.surface !== undefined &&
      answers.type_logement !== undefined
    );
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const primeAnnuelle = Number(answers.prime_annuelle) || 0;
    const surface = Number(answers.surface) || 0;
    const typeLogement = answers.type_logement as string;
    const statutOccupation = answers.statut_occupation as string;

    // Prix de base au m²
    let prixM2Base = 2; // Prix moyen au m² pour un appartement locataire

    // Ajustement selon le type de logement
    if (typeLogement === "maison") {
      prixM2Base = 2.5; // Les maisons coûtent plus cher
    } else if (typeLogement === "colocation") {
      prixM2Base = 1.8; // Colocation souvent moins cher
    }

    // Ajustement selon le statut
    if (statutOccupation === "proprietaire") {
      prixM2Base *= 1.3; // Propriétaire occupant : plus de garanties
    } else if (statutOccupation === "bailleur" || statutOccupation === "pno") {
      prixM2Base *= 1.5; // PNO/Bailleur : prime plus élevée
    }

    // Calcul de la fourchette de prix attendue
    const expectedMin = surface * prixM2Base * 0.6;
    const expectedMax = surface * prixM2Base * 1.8;

    // Description du profil
    const getProfilDescription = () => {
      const parts = [];
      if (typeLogement === "maison") parts.push("maison");
      else if (typeLogement === "appartement") parts.push("appartement");
      else if (typeLogement === "colocation") parts.push("colocation");

      parts.push(`${surface}m²`);

      if (statutOccupation === "proprietaire") parts.push("propriétaire occupant");
      else if (statutOccupation === "locataire") parts.push("locataire");
      else if (statutOccupation === "bailleur") parts.push("bailleur");
      else if (statutOccupation === "pno") parts.push("PNO");

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
          description: `Tu paies ${primeAnnuelle.toLocaleString("fr-FR")}€/an, c'est beaucoup trop pour ton logement.`,
          fullDescription: `Pour ton profil (${profilDesc}), une assurance habitation coûte généralement entre ${Math.round(expectedMin).toLocaleString("fr-FR")}€ et ${Math.round(expectedMax).toLocaleString("fr-FR")}€/an. Tu paies ${Math.round(((primeAnnuelle - expectedMax) / expectedMax) * 100)}% de plus que la fourchette haute. Compare avec d'autres assureurs.`,
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
          title: "Prix élevé pour ton logement",
          description: `Ta cotisation de ${primeAnnuelle.toLocaleString("fr-FR")}€/an est au-dessus de la moyenne.`,
          fullDescription: `Pour ton profil (${profilDesc}), une assurance habitation coûte généralement entre ${Math.round(expectedMin).toLocaleString("fr-FR")}€ et ${Math.round(expectedMax).toLocaleString("fr-FR")}€/an. Vérifie que ton niveau de garanties justifie ce surcoût.`,
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
          title: "Prix très bas : garanties limitées ?",
          description: `Ta cotisation de ${primeAnnuelle.toLocaleString("fr-FR")}€/an est très basse.`,
          fullDescription: `Pour ton profil (${profilDesc}), une assurance habitation coûte généralement entre ${Math.round(expectedMin).toLocaleString("fr-FR")}€ et ${Math.round(expectedMax).toLocaleString("fr-FR")}€/an. Un prix aussi bas peut signifier des garanties très limitées ou une valeur mobilier sous-estimée.`,
        },
        savingsImpact: null,
      };
    }

    // Prix normal
    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Prix cohérent avec ton logement",
        description: `Ta cotisation de ${primeAnnuelle.toLocaleString("fr-FR")}€/an est dans la moyenne.`,
        fullDescription: `Pour ton profil (${profilDesc}), une assurance habitation coûte généralement entre ${Math.round(expectedMin).toLocaleString("fr-FR")}€ et ${Math.round(expectedMax).toLocaleString("fr-FR")}€/an. Ton tarif est cohérent avec le marché.`,
      },
      savingsImpact: null,
    };
  }
}
