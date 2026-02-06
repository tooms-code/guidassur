import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class PrixAgeVehiculeStrategy implements IStrategy {
  id = "auto_prix_age_vehicule";
  name = "Cohérence prix/âge/véhicule";
  category = "tarif" as const;
  isFreeInsight = true;

  applies(answers: Record<string, unknown>): boolean {
    return (
      answers.prime_annuelle !== undefined &&
      answers.age_conducteur !== undefined &&
      answers.type_vehicule !== undefined
    );
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const primeAnnuelle = Number(answers.prime_annuelle) || 0;
    const age = Number(answers.age_conducteur) || 0;
    const typeVehicule = answers.type_vehicule as string;
    const puissance = answers.puissance_vehicule as string;

    // Calcul du coefficient de risque basé sur l'âge
    let coeffAge = 1;
    if (age < 25) {
      coeffAge = 2.5; // Jeune conducteur : prime très élevée
    } else if (age < 30) {
      coeffAge = 1.8; // Jeune : prime élevée
    } else if (age < 60) {
      coeffAge = 1; // Adulte : prime normale
    } else if (age < 70) {
      coeffAge = 1.2; // Senior : légère augmentation
    } else {
      coeffAge = 1.5; // Senior+ : augmentation
    }

    // Calcul du coefficient de risque basé sur le véhicule
    let coeffVehicule = 1;
    if (typeVehicule === "sportive") {
      coeffVehicule = 2;
    } else if (typeVehicule === "suv") {
      coeffVehicule = 1.3;
    } else if (typeVehicule === "berline") {
      coeffVehicule = 1.1;
    } else if (typeVehicule === "utilitaire") {
      coeffVehicule = 1.2;
    } else if (typeVehicule === "camping_car") {
      coeffVehicule = 1.4;
    } else if (typeVehicule === "moto") {
      coeffVehicule = 1.8;
    } else if (typeVehicule === "scooter") {
      coeffVehicule = 1.3;
    }

    // Calcul du coefficient de risque basé sur la puissance
    let coeffPuissance = 1;
    if (puissance === "plus_10cv") {
      coeffPuissance = 1.5;
    } else if (puissance === "8_10cv") {
      coeffPuissance = 1.2;
    } else if (puissance === "5_7cv") {
      coeffPuissance = 1;
    } else if (puissance === "moins_5cv") {
      coeffPuissance = 0.9;
    }

    // Prix attendu basé sur les coefficients
    const prixBase = 500;
    const expectedMin = prixBase * coeffAge * coeffVehicule * coeffPuissance * 0.7;
    const expectedMax = prixBase * coeffAge * coeffVehicule * coeffPuissance * 1.5;

    // Description du profil
    const getProfilDescription = () => {
      const parts = [];
      if (age < 25) parts.push("jeune conducteur");
      else if (age < 30) parts.push("conducteur récent");
      else if (age >= 70) parts.push("conducteur senior");

      if (typeVehicule === "sportive") parts.push("véhicule sportif");
      else if (typeVehicule === "suv") parts.push("SUV");
      else if (typeVehicule === "moto") parts.push("moto");
      else if (typeVehicule === "camping_car") parts.push("camping-car");

      if (puissance === "plus_10cv") parts.push("forte puissance");

      return parts.length > 0 ? parts.join(" + ") : "profil standard";
    };

    const profilDesc = getProfilDescription();

    // Prix très élevé par rapport au profil
    if (primeAnnuelle > expectedMax * 1.5) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Prix anormalement élevé",
          description: `Tu paies ${primeAnnuelle.toLocaleString("fr-FR")}€/an, c'est beaucoup trop pour ton profil.`,
          fullDescription: `Avec ton profil (${profilDesc}, ${age} ans), une assurance auto coûte généralement entre ${Math.round(expectedMin).toLocaleString("fr-FR")}€ et ${Math.round(expectedMax).toLocaleString("fr-FR")}€/an. Tu paies ${Math.round(((primeAnnuelle - expectedMax) / expectedMax) * 100)}% de plus que la fourchette haute. Compare avec d'autres assureurs.`,
        },
        savingsImpact: { min: Math.round(primeAnnuelle - expectedMax), max: Math.round(primeAnnuelle - expectedMin) },
      };
    }

    // Prix élevé mais peut être justifié
    if (primeAnnuelle > expectedMax) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Prix élevé pour ton profil",
          description: `Ta cotisation de ${primeAnnuelle.toLocaleString("fr-FR")}€/an est au-dessus de la moyenne.`,
          fullDescription: `Pour ton profil (${profilDesc}, ${age} ans), une assurance auto coûte généralement entre ${Math.round(expectedMin).toLocaleString("fr-FR")}€ et ${Math.round(expectedMax).toLocaleString("fr-FR")}€/an. Vérifie que ton niveau de garanties (tous risques, franchise basse, etc.) justifie ce surcoût.`,
        },
        savingsImpact: { min: Math.round((primeAnnuelle - expectedMax) * 0.3), max: Math.round(primeAnnuelle - expectedMax) },
      };
    }

    // Prix suspect car trop bas (possible sous-assurance)
    if (primeAnnuelle < expectedMin * 0.6) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Prix très bas : garanties limitées ?",
          description: `Ta cotisation de ${primeAnnuelle.toLocaleString("fr-FR")}€/an est très basse pour ton profil.`,
          fullDescription: `Pour ton profil (${profilDesc}, ${age} ans), une assurance auto coûte généralement entre ${Math.round(expectedMin).toLocaleString("fr-FR")}€ et ${Math.round(expectedMax).toLocaleString("fr-FR")}€/an. Un prix aussi bas peut signifier des garanties très limitées (Tiers simple) ou une franchise très élevée.`,
        },
        savingsImpact: null,
      };
    }

    // Prix dans la fourchette normale
    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Prix cohérent avec ton profil",
        description: `Ta cotisation de ${primeAnnuelle.toLocaleString("fr-FR")}€/an est dans la moyenne.`,
        fullDescription: `Pour ton profil (${profilDesc}, ${age} ans), une assurance auto coûte généralement entre ${Math.round(expectedMin).toLocaleString("fr-FR")}€ et ${Math.round(expectedMax).toLocaleString("fr-FR")}€/an. Ton tarif est cohérent avec le marché.`,
      },
      savingsImpact: null,
    };
  }
}
