import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class HospitalisationStrategy implements IStrategy {
  id = "mutuelle_hospitalisation";
  name = "Hospitalisation";
  category = "couverture" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.chambre_individuelle !== undefined || answers.options_garanties !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const wantsChambreIndividuelle = answers.chambre_individuelle === true;
    const garanties = (answers.options_garanties as string[]) || [];
    const hasHospitalisation = garanties.includes("hospitalisation");
    const hasChambreSeule = garanties.includes("chambre_seule");

    if (wantsChambreIndividuelle && !hasChambreSeule) {
      return {
        status: "DANGER",
        priority: "P1",
        insight: {
          title: "Chambre individuelle non couverte",
          description: "La chambre individuelle est importante pour toi mais tu n'as pas cette garantie.",
          fullDescription: "Une chambre particulière coûte 60 à 150€/jour selon les établissements. Sans cette garantie, une hospitalisation de 5 jours pourrait coûter 300-750€ de ta poche. Ajoute cette option ou change de formule.",
        },
        savingsImpact: null,
      };
    }

    if (!hasHospitalisation) {
      return {
        status: "ATTENTION",
        priority: "P2",
        insight: {
          title: "Hospitalisation standard",
          description: "Tu n'as pas de garantie hospitalisation renforcée.",
          fullDescription: "Sans garantie hospitalisation renforcée, le forfait journalier hospitalier (20€/jour) et les éventuels dépassements chirurgicaux restent à ta charge. Pour une hospitalisation programmée, vérifie ta couverture.",
        },
        savingsImpact: null,
      };
    }

    if (hasHospitalisation && hasChambreSeule) {
      return {
        status: "OK",
        priority: "P3",
        insight: {
          title: "Excellente couverture hospitalisation",
          description: "Tu es bien couvert en cas d'hospitalisation avec chambre seule.",
          fullDescription: "Ta mutuelle prend en charge l'hospitalisation renforcée et la chambre particulière. Tu es serein en cas de séjour à l'hôpital.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Bonne couverture hospitalisation",
        description: "Tu as une garantie hospitalisation renforcée.",
        fullDescription: "Ta mutuelle améliore la prise en charge en cas d'hospitalisation. Vérifie les détails (forfait journalier, dépassements chirurgicaux) dans ton contrat.",
      },
      savingsImpact: null,
    };
  }
}
