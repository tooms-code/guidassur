import {
  Shield,
  Car,
  Home,
  Heart,
  AlertTriangle,
  Eye,
  Scale,
  Calendar,
  MessageSquare,
  FileText,
  Percent,
  Clock,
  TrendingDown,
  CheckCircle,
  XCircle,
  Info,
  type LucideIcon,
} from "lucide-react";

// Types
export interface InsuranceGuarantee {
  id: string;
  title: string;
  description: string;
  importance: "essential" | "recommended" | "optional";
}

export interface InsuranceAccordionItem {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  guarantees: InsuranceGuarantee[];
}

export interface PitfallItem {
  id: string;
  title: string;
  description: string;
}

export interface VigilancePoint {
  id: string;
  term: string;
  definition: string;
  icon: LucideIcon;
}

export interface FranchiseType {
  id: string;
  name: string;
  description: string;
  example: string;
}

export interface NegotiationTip {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface TabContent {
  id: string;
  label: string;
  icon: LucideIcon;
}

// Tab definitions
export const COMPRENDRE_TABS: TabContent[] = [
  { id: "garanties", label: "Garanties essentielles", icon: Shield },
  { id: "pieges", label: "Pièges à éviter", icon: AlertTriangle },
  { id: "franchises", label: "Franchises", icon: Percent },
  { id: "renegocier", label: "Renégocier", icon: MessageSquare },
];

// Tab 1: Garanties essentielles
export const GARANTIES_INTRO = {
  title: "Vos garanties, décryptées",
  description:
    "Chaque contrat d'assurance contient des garanties essentielles et d'autres plus optionnelles. Comprendre ce qui vous couvre vraiment est la première étape pour faire les bons choix.",
};

export const INSURANCE_ACCORDIONS: InsuranceAccordionItem[] = [
  {
    id: "auto",
    title: "Assurance Auto",
    icon: Car,
    color: "blue",
    guarantees: [
      {
        id: "rc-auto",
        title: "Responsabilité Civile (RC)",
        description:
          "Obligatoire. Couvre les dommages que vous causez à autrui (corporels et matériels).",
        importance: "essential",
      },
      {
        id: "vol-incendie",
        title: "Vol et Incendie",
        description:
          "Protège votre véhicule en cas de vol, tentative de vol ou incendie. Recommandé pour les véhicules récents.",
        importance: "recommended",
      },
      {
        id: "bris-glace",
        title: "Bris de glace",
        description:
          "Couvre le remplacement ou la réparation des vitres (pare-brise, lunette arrière, vitres latérales). Attention : les rétroviseurs ne sont souvent pas pris en compte et cette garantie peut être proposée en option.",
        importance: "recommended",
      },
      {
        id: "tous-risques",
        title: "Tous risques (dommages tous accidents)",
        description:
          "Couvre votre véhicule même si vous êtes responsable de l'accident. Pertinent pour les véhicules de valeur ou avec un crédit auto (pour être remboursé du crédit en cas d'accident).",
        importance: "optional",
      },
      {
        id: "assistance",
        title: "Assistance 0 km",
        description:
          "Dépannage et remorquage même devant chez vous. Utile si vous utilisez votre véhicule quotidiennement.",
        importance: "optional",
      },
    ],
  },
  {
    id: "habitation",
    title: "Assurance Habitation",
    icon: Home,
    color: "amber",
    guarantees: [
      {
        id: "rc-habitation",
        title: "Responsabilité Civile",
        description:
          "Obligatoire pour les locataires. Couvre les dommages causés à autrui depuis votre logement.",
        importance: "essential",
      },
      {
        id: "degats-eaux",
        title: "Dégâts des eaux",
        description:
          "Couvre les dommages causés par l'eau (fuites, infiltrations). Représente 50% des sinistres habitation.",
        importance: "essential",
      },
      {
        id: "incendie-hab",
        title: "Incendie et explosion",
        description:
          "Protection contre les incendies, explosions et dommages liés à la fumée.",
        importance: "essential",
      },
      {
        id: "vol-hab",
        title: "Vol et vandalisme",
        description:
          "Indemnisation en cas de cambriolage ou de dégradations. Vérifiez les conditions de sécurité exigées.",
        importance: "recommended",
      },
      {
        id: "catastrophes",
        title: "Catastrophes naturelles",
        description:
          "Incluse par défaut. Couvre les dommages liés aux événements naturels déclarés par arrêté.",
        importance: "essential",
      },
    ],
  },
  {
    id: "mutuelle",
    title: "Mutuelle Santé",
    icon: Heart,
    color: "green",
    guarantees: [
      {
        id: "hospitalisation",
        title: "Hospitalisation",
        description:
          "Complète les remboursements de la Sécurité sociale pour les frais d'hospitalisation (chambre, forfait journalier). Essentiel pour éviter les restes à charge importants.",
        importance: "essential",
      },
      {
        id: "dentaire",
        title: "Soins dentaires (prothèses, orthodontie)",
        description:
          "Couronnes, bridges, implants, appareils dentaires. Les dépassements d'honoraires peuvent atteindre plusieurs milliers d'euros. À privilégier selon vos besoins.",
        importance: "recommended",
      },
      {
        id: "optique",
        title: "Optique (lunettes, lentilles)",
        description:
          "Remboursement des lunettes, lentilles et verres progressifs. Les tarifs varient énormément d'une mutuelle à l'autre. Important si vous portez des corrections.",
        importance: "recommended",
      },
      {
        id: "depassements-honoraires",
        title: "Dépassements d'honoraires",
        description:
          "Prise en charge des dépassements chez les médecins en secteur 2 (spécialistes). Utile si vous consultez régulièrement des spécialistes pratiquant des dépassements.",
        importance: "optional",
      },
      {
        id: "medecines-douces",
        title: "Médecines douces",
        description:
          "Ostéopathie, acupuncture, naturopathie... À considérer selon vos habitudes de soin.",
        importance: "optional",
      },
    ],
  },
  {
    id: "gav",
    title: "Garantie Accidents de la Vie",
    icon: Shield,
    color: "rose",
    guarantees: [
      {
        id: "accidents-domestiques",
        title: "Accidents domestiques",
        description:
          "Chutes, brûlures, coupures à la maison. 1ère cause de décès chez les enfants.",
        importance: "essential",
      },
      {
        id: "accidents-loisirs",
        title: "Accidents de loisirs",
        description:
          "Sport, bricolage, jardinage. Couvre les activités du quotidien hors travail.",
        importance: "essential",
      },
      {
        id: "accidents-medicaux",
        title: "Accidents médicaux",
        description:
          "Complications suite à une intervention chirurgicale ou un traitement médical.",
        importance: "recommended",
      },
      {
        id: "agressions",
        title: "Agressions et attentats",
        description:
          "Protection en cas d'agression physique ou d'acte terroriste.",
        importance: "recommended",
      },
      {
        id: "capital-invalidite",
        title: "Capital invalidité",
        description:
          "Versement d'un capital en cas d'invalidité permanente. Vérifiez le seuil de déclenchement (idéalement ≤ 10%).",
        importance: "essential",
      },
    ],
  },
];

// Tab 2: Pièges à éviter
export const PITFALLS: PitfallItem[] = [
  {
    id: "exclusions",
    title: "Ne pas lire les exclusions",
    description:
      "Les exclusions définissent ce qui n'est PAS couvert. C'est souvent là que se cachent les mauvaises surprises.",
  },
  {
    id: "sous-estimation",
    title: "Sous-estimer la valeur des biens",
    description:
      "Déclarer une valeur inférieure pour payer moins cher = indemnisation réduite proportionnellement en cas de sinistre.",
  },
  {
    id: "changements",
    title: "Oublier de déclarer les changements",
    description:
      "Déménagement, travaux, nouvel enfant... Tout changement doit être signalé sous peine de nullité du contrat.",
  },
  {
    id: "doublons",
    title: "Payer plusieurs fois la même garantie",
    description:
      "Protection juridique dans l'habitation + protection juridique de votre carte bancaire = vous payez deux fois la même couverture. Vérifiez les doublons avant de souscrire.",
  },
  {
    id: "pas-comparer",
    title: "Ne jamais comparer",
    description:
      "Les tarifs varient du simple au double pour des garanties équivalentes. Comparez au moins tous les 2-3 ans.",
  },
];

export const VIGILANCE_POINTS: VigilancePoint[] = [
  {
    id: "franchise",
    term: "Franchise",
    definition:
      "Somme qui reste à votre charge en cas de sinistre. Plus elle est élevée, moins votre prime est chère.",
    icon: Scale,
  },
  {
    id: "carence",
    term: "Délai de carence",
    definition:
      "Période après souscription pendant laquelle vous n'êtes pas couvert. Peut aller de 1 à 12 mois selon les garanties.",
    icon: Clock,
  },
  {
    id: "plafonds",
    term: "Plafonds d'indemnisation",
    definition:
      "Montant maximum que l'assureur vous remboursera. Au-delà, c'est pour votre poche.",
    icon: TrendingDown,
  },
  {
    id: "vetuste",
    term: "Vétusté",
    definition:
      "Dépréciation de vos biens avec le temps. Un canapé de 10 ans ne sera pas remboursé au prix du neuf.",
    icon: Calendar,
  },
];

// Tab 3: Franchises
export const FRANCHISE_INTRO = {
  title: "C'est quoi une franchise ?",
  description:
    "La franchise est la somme qui reste à votre charge après un sinistre. C'est le montant que vous « payez » avant que l'assurance prenne le relais.",
  relationship:
    "Plus votre franchise est élevée, plus votre prime annuelle est basse. C'est un arbitrage entre économie immédiate et risque financier en cas de pépin.",
};

export const FRANCHISE_TYPES: FranchiseType[] = [
  {
    id: "fixe",
    name: "Franchise fixe",
    description: "Un montant en euros défini à l'avance.",
    example: "Exemple : 150€ de franchise = vous payez les 150 premiers euros de chaque sinistre.",
  },
  {
    id: "proportionnelle",
    name: "Franchise proportionnelle",
    description: "Un pourcentage du montant du sinistre.",
    example: "Exemple : 10% de franchise sur un sinistre de 2000€ = 200€ à votre charge.",
  },
  {
    id: "mixte",
    name: "Franchise mixte",
    description: "Combine un minimum fixe et un pourcentage.",
    example:
      "Exemple : 10% du sinistre avec un minimum de 150€ et un maximum de 500€.",
  },
];

export const FRANCHISE_ADVICE = {
  title: "Comment bien choisir ?",
  tips: [
    {
      id: "elevee",
      label: "Franchise élevée (300-500€)",
      description:
        "Vous payez moins chaque mois mais prenez plus de risques. Adapté si vous avez peu de sinistres et une épargne de précaution.",
      icon: TrendingDown,
    },
    {
      id: "faible",
      label: "Franchise faible (50-150€)",
      description:
        "Prime plus élevée mais tranquillité d'esprit. Recommandé si vous déclarez régulièrement des sinistres.",
      icon: Shield,
    },
  ],
  recommendation:
    "Pour la plupart des profils, une franchise entre 150€ et 400€ offre un bon équilibre coût/protection.",
};

// Tab 4: Renégocier
export const RENEGOTIATION_TIMING = {
  title: "Quand renégocier ?",
  situations: [
    {
      id: "echeance",
      title: "À l'échéance annuelle",
      description:
        "Vous pouvez résilier à tout moment après 1 an de contrat (loi Hamon). Profitez-en pour faire le point.",
      icon: Calendar,
    },
    {
      id: "sans-sinistre",
      title: "Après plusieurs années sans sinistre",
      description:
        "Votre bonus s'améliore, votre profil de risque aussi. Négociez une baisse ou changez d'assureur.",
      icon: CheckCircle,
    },
    {
      id: "changement",
      title: "Changement de situation",
      description:
        "Déménagement, mariage, retraite, télétravail... Autant d'occasions de revoir vos besoins et vos tarifs.",
      icon: FileText,
    },
    {
      id: "meilleure-offre",
      title: "Vous trouvez mieux ailleurs",
      description:
        "Si un concurrent propose mieux pour moins cher, utilisez ce devis comme levier de négociation.",
      icon: Eye,
    },
  ],
};

export const NEGOTIATION_CHECKLIST: NegotiationTip[] = [
  {
    id: "dossier",
    title: "Préparez votre dossier",
    description:
      "Rassemblez vos contrats actuels, historique de sinistres, relevé d'information. C'est votre base de négociation.",
    icon: FileText,
  },
  {
    id: "contact",
    title: "Contactez avant de résilier",
    description:
      "Appelez votre assureur actuel avec une offre concurrente en main. La rétention client est leur priorité.",
    icon: MessageSquare,
  },
  {
    id: "garanties",
    title: "Supprimez les garanties inutiles",
    description:
      "Assistance incluse dans votre carte bancaire ? RC en double ? Faites le ménage.",
    icon: XCircle,
  },
  {
    id: "franchise-neg",
    title: "Jouez sur la franchise",
    description:
      "Accepter une franchise plus élevée peut réduire votre prime de 10 à 20%.",
    icon: Percent,
  },
  {
    id: "regrouper",
    title: "Regroupez vos contrats",
    description:
      "Multi-équipement (auto + habitation + santé + garantie accidents de la vie) = réduction de 5 à 15% chez la plupart des assureurs.",
    icon: Home,
  },
];

// Disclaimer
export const DISCLAIMER = {
  title: "Information importante",
  content:
    "Ces conseils sont fournis à titre informatif et ne constituent pas un conseil personnalisé. Pour une analyse adaptée à votre situation, nous vous recommandons de consulter un courtier en assurance agréé.",
};

// CTA
export const CTA_CONTENT = {
  title: "Prêt à y voir plus clair ?",
  description:
    "Analysez votre contrat en quelques clics et découvrez si vous êtes vraiment bien couvert.",
  buttonText: "Analyser mon contrat gratuitement",
  buttonHref: "/questionnaire",
};
