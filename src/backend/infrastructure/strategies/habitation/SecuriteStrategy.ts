import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class SecuriteStrategy implements IStrategy {
  id = "hab_securite";
  name = "Système de sécurité";
  category = "risque" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.systeme_securite !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const securite = answers.systeme_securite as string;
    const typeLogement = answers.type_logement as string;
    const etage = answers.etage as string;
    const isExposed = typeLogement === "maison" || etage === "rdc";

    if (["alarme", "camera"].includes(securite)) {
      return {
        status: "OK",
        priority: "P3",
        insight: {
          title: "Bonne sécurité",
          description: "Ton système de sécurité peut te faire bénéficier de réductions.",
          fullDescription: "Une alarme ou des caméras peuvent réduire ta prime de 5 à 15%. Signale-le à ton assureur si ce n'est pas déjà fait. Certains assureurs exigent une sécurité pour la garantie vol.",
        },
        savingsImpact: { min: 20, max: 50 },
      };
    }

    if (securite === "digicode") {
      return {
        status: "ATTENTION",
        priority: "P3",
        insight: {
          title: "Sécurité minimale",
          description: "Un digicode protège l'accès mais pas ton logement directement.",
          fullDescription: "Le digicode limite les accès à l'immeuble mais n'empêche pas une effraction de ton logement. Une alarme offrirait une meilleure protection et des avantages tarifaires.",
        },
        savingsImpact: null,
      };
    }

    if (isExposed) {
      return {
        status: "DANGER",
        priority: "P2",
        insight: {
          title: "Aucune sécurité - logement exposé",
          description: "Tu es en RDC ou maison sans système de sécurité. Le risque de vol est élevé.",
          fullDescription: "Sans alarme ni caméra, ton logement est une cible facile. Un système d'alarme connecté coûte 200-500€ et peut réduire ta prime d'assurance tout en te protégeant.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "ATTENTION",
      priority: "P3",
      insight: {
        title: "Pas de système de sécurité",
        description: "Un système de sécurité pourrait réduire ta prime et te protéger.",
        fullDescription: "Même en appartement en étage, une alarme dissuade les cambrioleurs et peut te faire économiser sur ta prime. Renseigne-toi auprès de ton assureur.",
      },
      savingsImpact: null,
    };
  }
}
