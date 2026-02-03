import { QuestionConfig } from "@/shared/types/questionnaire";

export const gavQuestions: QuestionConfig[] = [
  // Step: Ton contrat
  {
    id: "prime_annuelle",
    step: "Ton contrat",
    type: "number",
    label: "Combien paies-tu par an pour ta GAV ?",
    unit: "€",
    required: true,
    placeholder: "150",
    tip: {
      text: "Une GAV coûte généralement entre 100€ et 200€/an pour une bonne couverture.",
      icon: "info",
    },
  },

  // Step: Ton profil
  {
    id: "age_assure",
    step: "Ton profil",
    type: "number",
    label: "Quel âge as-tu ?",
    required: true,
    min: 18,
    max: 99,
    placeholder: "35",
    tip: {
      text: "La GAV couvre les accidents de la vie quotidienne, pas uniquement professionnels.",
      icon: "info",
    },
  },
  {
    id: "capital_invalidite",
    step: "Ton profil",
    type: "number",
    label: "Quel est le capital invalidité de ton contrat ?",
    unit: "€",
    required: true,
    placeholder: "1000000",
    tip: {
      text: "C'est le montant maximum versé en cas d'invalidité totale. Recommandé : au moins 1 million €.",
      icon: "lightbulb",
    },
  },
  {
    id: "taux_minimum_invalidite",
    step: "Ton profil",
    type: "single-choice",
    label: "Quel est le taux minimum d'invalidité pour être indemnisé ?",
    required: true,
    options: [
      { value: "1", label: "1%" },
      { value: "5", label: "5%" },
      { value: "10", label: "10%" },
      { value: "30", label: "30%" },
      { value: "50", label: "50%" },
    ],
    tip: {
      text: "Plus le seuil est bas, plus tu es couvert tôt. Un seuil à 30% exclut beaucoup de situations.",
      icon: "alert",
    },
  },
  {
    id: "enfants_charge",
    step: "Ton profil",
    type: "yes-no",
    label: "As-tu des enfants à charge ?",
    required: true,
    tip: {
      text: "Les enfants peuvent être couverts par ta GAV. Vérifie les conditions.",
      icon: "info",
    },
  },
  {
    id: "sports_risque",
    step: "Ton profil",
    type: "yes-no",
    label: "Pratiques-tu des sports à risque ?",
    required: true,
    tip: {
      text: "Certains sports sont exclus des GAV standard. Il faut parfois une extension.",
      icon: "alert",
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
