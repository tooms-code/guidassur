export const APP_NAME = "Guidassur";

export interface PricingPlan {
  name: string;
  price: number;
  description: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
}

export const PRICING: Record<string, PricingPlan> = {
  free: {
    name: "Découverte",
    price: 0,
    description: "Pour tester le service",
    features: [
      "1 analyse de contrat",
      "Résumé des garanties",
      "Points d'attention",
    ],
    cta: "Commencer gratuitement",
    href: "/analyser",
    popular: true,
  },
  single: {
    name: "Analyse complète",
    price: 4.9,
    description: "Pour une analyse approfondie",
    features: [
      "1 analyse complète",
      "Détail des exclusions",
      "Recommandations personnalisées",
      "Export PDF",
    ],
    cta: "Analyser mon contrat",
    href: "/analyser?plan=single",
  },
  pack: {
    name: "Pack 3 contrats",
    price: 25,
    description: "Pour analyser plusieurs contrats",
    features: [
      "3 analyses complètes",
      "Comparaison de contrats",
      "Recommandations personnalisées",
      "Export PDF",
      "Support prioritaire",
    ],
    cta: "Choisir ce pack",
    href: "/analyser?plan=pack",
  },
};

export const FAQ_ITEMS = [
  {
    question: "Comment fonctionne l'analyse de contrat ?",
    answer:
      "Téléchargez votre contrat d'assurance en PDF. Nos algorithmes analysent le document et vous fournissent un résumé clair des garanties, des exclusions et des points d'attention en quelques secondes.",
  },
  {
    question: "Mes documents sont-ils sécurisés ?",
    answer:
      "Oui, vos documents sont chiffrés et supprimés après analyse. Nous ne conservons aucune donnée personnelle et ne partageons jamais vos informations avec des tiers.",
  },
  {
    question: "Quels types de contrats puis-je analyser ?",
    answer:
      "Vous pouvez analyser tous types de contrats d'assurance : auto, habitation, santé, vie, et bien d'autres. Nos algorithmes sont entraînés sur des milliers de contrats français.",
  },
  {
    question: "L'analyse remplace-t-elle un conseiller ?",
    answer:
      "Notre outil vous aide à comprendre votre contrat rapidement, mais ne remplace pas les conseils d'un professionnel pour des décisions importantes. Il vous permet d'être mieux informé avant un rendez-vous.",
  },
];
