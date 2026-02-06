import { QuestionConfig } from "@/shared/types/questionnaire";

export const gavQuestions: QuestionConfig[] = [
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
      text: "C'est le montant maximum versé en cas d'invalidité totale. Ce capital doit permettre de couvrir les adaptations nécessaires (logement, véhicule, aide à domicile).",
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
      text: "Le taux minimum d'invalidité est le seuil à partir duquel l'assurance commence à indemniser. Par exemple, avec un seuil de 10%, seules les séquelles évaluées à 10% d'invalidité ou plus seront indemnisées. Un seuil bas (1-5%) offre une meilleure protection.",
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
