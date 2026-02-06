import { IStrategy, StrategyResult } from "@/backend/domain/interfaces/IStrategy";

export class ObjetsValeurStrategy implements IStrategy {
  id = "hab_objets_valeur";
  name = "Objets de valeur";
  category = "couverture" as const;
  isFreeInsight = false;

  applies(answers: Record<string, unknown>): boolean {
    return answers.objets_valeur !== undefined;
  }

  evaluate(answers: Record<string, unknown>): StrategyResult {
    const objetsValeur = answers.objets_valeur as string;
    const garanties = (answers.options_garanties as string[]) || [];
    const hasVol = garanties.includes("vol");

    // Pas d'objets de valeur
    if (objetsValeur === "aucun") {
      return {
        status: "OK",
        priority: "P3",
        insight: {
          title: "Pas d'objets de valeur particuliers",
          description: "Tu n'as pas déclaré d'objets de valeur spécifiques.",
          fullDescription: "Sans objets de valeur particuliers, le plafond standard de ton contrat devrait suffire pour couvrir tes biens.",
        },
        savingsImpact: null,
      };
    }

    // Moins de 1k - risque faible même sans garantie vol
    if (objetsValeur === "moins_1k") {
      if (!hasVol) {
        return {
          status: "ATTENTION",
          priority: "P3",
          insight: {
            title: "Objets de valeur modestes sans garantie vol",
            description: "Tes objets de valeur (< 1 000€) ne sont pas couverts en cas de vol.",
            fullDescription: "Avec des objets de faible valeur, l'absence de garantie vol est moins préoccupante, mais vérifie tout de même les plafonds de ton contrat standard.",
          },
          savingsImpact: null,
        };
      }
      return {
        status: "OK",
        priority: "P3",
        insight: {
          title: "Objets de valeur correctement couverts",
          description: "Tes objets de valeur sont couverts par ta garantie vol.",
          fullDescription: "Tes objets de faible valeur sont bien couverts. Vérifie que le plafond standard de ton contrat est suffisant pour couvrir l'ensemble de tes biens de valeur.",
        },
        savingsImpact: null,
      };
    }

    // Entre 1k et 3k
    if (objetsValeur === "1k_3k") {
      if (!hasVol) {
        return {
          status: "DANGER",
          priority: "P2",
          insight: {
            title: "Objets de valeur non couverts contre le vol",
            description: "Tes objets de valeur (1 000-3 000€) ne sont pas couverts en cas de vol.",
            fullDescription: "Sans garantie vol, tes objets de valeur ne seront pas remboursés en cas de cambriolage. Ajoute cette garantie à ton contrat.",
          },
          savingsImpact: null,
        };
      }
      return {
        status: "ATTENTION",
        priority: "P3",
        insight: {
          title: "Vérifie les plafonds de ton contrat",
          description: "Tes objets de valeur (1 000-3 000€) sont dans la limite des plafonds standards.",
          fullDescription: "Les contrats standard appliquent souvent des plafonds de remboursement pour les objets de valeur. Vérifie que ce plafond couvre bien tous tes objets. Si nécessaire, déclare-les spécifiquement à ton assureur.",
        },
        savingsImpact: null,
      };
    }

    // Plus de 3k - risque élevé
    if (objetsValeur === "plus_3k") {
      if (!hasVol) {
        return {
          status: "DANGER",
          priority: "P1",
          insight: {
            title: "Objets de valeur élevée non couverts",
            description: "Tes objets de valeur (> 3 000€) ne sont pas couverts en cas de vol.",
            fullDescription: "Sans garantie vol, tes objets de valeur ne seront pas remboursés en cas de cambriolage. Avec une valeur dépassant 3 000€, c'est un risque financier important. Ajoute impérativement cette garantie.",
          },
          savingsImpact: null,
        };
      }
      return {
        status: "DANGER",
        priority: "P2",
        insight: {
          title: "Objets de valeur élevée à déclarer",
          description: "Tes objets de valeur (> 3 000€) dépassent les plafonds standards.",
          fullDescription: "Les contrats standard appliquent généralement des plafonds de remboursement limités pour les objets de valeur. Avec une valeur importante, tes objets risquent de n'être que partiellement remboursés. Il est fortement recommandé de les déclarer spécifiquement à ton assureur ou de souscrire une extension de garantie.",
        },
        savingsImpact: null,
      };
    }

    return {
      status: "OK",
      priority: "P3",
      insight: {
        title: "Pas d'objets de valeur particuliers",
        description: "Tu n'as pas déclaré d'objets de valeur spécifiques.",
        fullDescription: "Sans objets de valeur particuliers, le plafond standard de ton contrat devrait suffire pour couvrir tes biens.",
      },
      savingsImpact: null,
    };
  }
}
