import { QuestionConfig } from "@/shared/types/questionnaire";

export const habitationQuestions: QuestionConfig[] = [
  // Step: Ton contrat
  {
    id: "prime_annuelle",
    step: "Ton contrat",
    type: "number",
    label: "Combien paies-tu par an pour ton assurance habitation ?",
    unit: "€",
    required: true,
    placeholder: "250",
    tip: {
      text: "Montant annuel total. Souvent prélevé mensuellement, multiplie par 12.",
      icon: "info",
    },
  },
  {
    id: "franchise",
    step: "Ton contrat",
    type: "number",
    label: "Quel est le montant de ta franchise ?",
    unit: "€",
    required: false,
    placeholder: "150",
    tip: {
      text: "Généralement entre 150€ et 500€. Vérifie qu'elle n'est pas trop élevée pour les dégâts des eaux, c'est le sinistre le plus fréquent.",
      icon: "lightbulb",
    },
  },
  {
    id: "options_garanties",
    step: "Ton contrat",
    type: "multi-choice",
    label: "Quelles garanties as-tu dans ton contrat ?",
    required: false,
    options: [
      { value: "vol", label: "Vol" },
      { value: "incendie", label: "Incendie" },
      { value: "degats_eaux", label: "Dégâts des eaux" },
      { value: "responsabilite_civile", label: "Responsabilité civile" },
      { value: "protection_juridique", label: "Protection juridique" },
      { value: "bris_glace", label: "Bris de glace" },
    ],
    tip: {
      text: "La responsabilité civile est obligatoire pour les locataires. Les autres garanties dépendent de ta situation.",
      icon: "info",
    },
  },

  // Step: Ton logement
  {
    id: "type_logement",
    step: "Ton logement",
    type: "single-choice",
    label: "Quel type de logement assures-tu ?",
    required: true,
    options: [
      { value: "appartement", label: "Appartement" },
      { value: "maison", label: "Maison" },
      { value: "colocation", label: "Colocation" },
    ],
  },
  {
    id: "surface",
    step: "Ton logement",
    type: "number",
    label: "Quelle est la surface de ton logement ?",
    unit: "m²",
    required: true,
    placeholder: "65",
    tip: {
      text: "Surface habitable, sans les dépendances. Elle détermine en partie ta prime.",
      icon: "info",
    },
  },
  {
    id: "statut_occupation",
    step: "Ton logement",
    type: "single-choice",
    label: "Quel est ton statut d'occupation ?",
    required: true,
    options: [
      { value: "locataire", label: "Locataire" },
      { value: "proprietaire", label: "Propriétaire occupant" },
      { value: "colocataire", label: "Colocataire" },
      { value: "bailleur", label: "Bailleur" },
      { value: "pno", label: "PNO (Propriétaire Non Occupant)" },
    ],
    tip: {
      text: "PNO = Propriétaire Non Occupant. Ton statut change les garanties nécessaires.",
      icon: "info",
    },
  },
  {
    id: "valeur_mobilier",
    step: "Ton logement",
    type: "single-choice",
    label: "Quelle est la valeur estimée de ton mobilier ?",
    required: true,
    options: [
      { value: "moins_3k", label: "< 3 000 €" },
      { value: "3k_10k", label: "3 000 - 10 000 €" },
      { value: "plus_10k", label: "> 10 000 €" },
    ],
    tip: {
      text: "Sous-estimer = être mal remboursé. Surestimer = payer trop cher. Fais un inventaire rapide.",
      icon: "lightbulb",
    },
  },
  {
    id: "systeme_securite",
    step: "Ton logement",
    type: "single-choice",
    label: "Quel système de sécurité as-tu ?",
    required: true,
    options: [
      { value: "aucun", label: "Aucun" },
      { value: "digicode", label: "Digicode" },
      { value: "alarme", label: "Alarme" },
      { value: "camera", label: "Caméra" },
    ],
    tip: {
      text: "Un système de sécurité peut réduire ta prime et est parfois exigé pour la garantie vol.",
      icon: "money",
    },
  },
  {
    id: "etage",
    step: "Ton logement",
    type: "single-choice",
    label: "À quel étage se situe ton logement ?",
    required: true,
    options: [
      { value: "rdc", label: "Rez-de-chaussée" },
      { value: "intermediaire", label: "Étage intermédiaire" },
      { value: "dernier", label: "Dernier étage" },
    ],
    tip: {
      text: "Le RDC a plus de risque de vol, le dernier étage plus de risque de dégâts des eaux (toiture).",
      icon: "info",
    },
  },
  {
    id: "usage_logement",
    step: "Ton logement",
    type: "single-choice",
    label: "Quel est l'usage de ce logement ?",
    required: true,
    options: [
      { value: "principale", label: "Résidence principale" },
      { value: "secondaire", label: "Résidence secondaire" },
      { value: "autre", label: "Autre" },
    ],
    tip: {
      text: "Une résidence secondaire inoccupée a des risques différents et souvent une prime plus élevée.",
      icon: "info",
    },
  },
  {
    id: "dependances",
    step: "Ton logement",
    type: "yes-no",
    label: "As-tu des dépendances (cave, garage, abri de jardin) ?",
    required: true,
    tip: {
      text: "Cave, garage, abri de jardin, remise... Tout espace couvert séparé du logement.",
      icon: "info",
    },
  },
  {
    id: "piscine",
    step: "Ton logement",
    type: "yes-no",
    label: "As-tu une piscine ?",
    required: true,
    tip: {
      text: "Une piscine augmente ta responsabilité civile. Certaines normes de sécurité sont obligatoires.",
      icon: "alert",
    },
  },
  {
    id: "objets_valeur",
    step: "Ton logement",
    type: "yes-no",
    label: "Possèdes-tu des objets de valeur (bijoux, œuvres d'art, collections) ?",
    required: true,
    tip: {
      text: "Bijoux, œuvres d'art, collections, instruments de musique... Souvent plafonnés dans les contrats standard.",
      icon: "money",
    },
  },

  // Step: Finalisation
  {
    id: "consentement_confidentialite",
    step: "Finalisation",
    type: "consent",
    label: "J'ai lu et j'accepte la politique de confidentialité",
    required: true,
  },
];
