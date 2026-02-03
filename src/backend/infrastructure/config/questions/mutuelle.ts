import { QuestionConfig } from "@/shared/types/questionnaire";

export const mutuelleQuestions: QuestionConfig[] = [
  // Step: Ton contrat
  {
    id: "prime_annuelle",
    step: "Ton contrat",
    type: "number",
    label: "Combien paies-tu par an pour ta mutuelle ?",
    unit: "€",
    required: true,
    placeholder: "600",
    tip: {
      text: "Cotisation totale sur l'année. Si c'est une mutuelle d'entreprise, c'est ta part salariale.",
      icon: "info",
    },
  },
  {
    id: "options_garanties",
    step: "Ton contrat",
    type: "multi-choice",
    label: "Quelles garanties renforcées as-tu ?",
    required: false,
    options: [
      { value: "hospitalisation", label: "Hospitalisation" },
      { value: "depassements", label: "Dépassements d'honoraires" },
      { value: "medecines_douces", label: "Médecines douces" },
      { value: "optique", label: "Optique renforcé" },
      { value: "dentaire", label: "Dentaire renforcé" },
      { value: "chambre_seule", label: "Chambre seule" },
    ],
    tip: {
      text: "Identifie les garanties importantes pour toi. Inutile de payer pour ce que tu n'utilises jamais.",
      icon: "lightbulb",
    },
  },

  // Step: Tes besoins santé
  {
    id: "age",
    step: "Tes besoins",
    type: "number",
    label: "Quel âge as-tu ?",
    required: true,
    min: 18,
    max: 99,
    placeholder: "35",
    tip: {
      text: "Les besoins évoluent avec l'âge. À 25 ans et à 60 ans, on n'a pas les mêmes priorités.",
      icon: "info",
    },
  },
  {
    id: "situation",
    step: "Tes besoins",
    type: "single-choice",
    label: "Quelle est ta situation professionnelle ?",
    required: true,
    options: [
      { value: "salarie", label: "Salarié" },
      { value: "etudiant", label: "Étudiant" },
      { value: "independant", label: "Indépendant" },
      { value: "retraite", label: "Retraité" },
    ],
    tip: {
      text: "Les salariés ont souvent une mutuelle d'entreprise obligatoire. Les indépendants doivent tout gérer eux-mêmes.",
      icon: "info",
    },
  },
  {
    id: "reste_a_charge",
    step: "Tes besoins",
    type: "number",
    label: "Quel est ton reste à charge annuel estimé ?",
    unit: "€/an",
    required: false,
    placeholder: "200",
    tip: {
      text: "C'est ce que tu paies de ta poche après remboursement Sécu + mutuelle. Un bon indicateur de ta couverture actuelle.",
      icon: "lightbulb",
    },
  },
  {
    id: "lunettes_lentilles",
    step: "Tes besoins",
    type: "yes-no",
    label: "Portes-tu des lunettes ou lentilles régulièrement ?",
    required: true,
    tip: {
      text: "Le remboursement optique varie énormément d'une mutuelle à l'autre. Les verres progressifs coûtent cher.",
      icon: "money",
    },
  },
  {
    id: "soins_dentaires",
    step: "Tes besoins",
    type: "yes-no",
    label: "As-tu des soins dentaires importants prévus ?",
    required: true,
    tip: {
      text: "Couronnes, implants, orthodontie... Les dépassements peuvent atteindre plusieurs milliers d'euros.",
      icon: "money",
    },
  },
  {
    id: "consultations_specialistes",
    step: "Tes besoins",
    type: "yes-no",
    label: "Consultes-tu fréquemment des spécialistes ?",
    required: true,
    tip: {
      text: "Dermato, ophtalmo, psy... Beaucoup pratiquent des dépassements d'honoraires non remboursés.",
      icon: "info",
    },
  },
  {
    id: "chambre_individuelle",
    step: "Tes besoins",
    type: "yes-no",
    label: "La chambre individuelle est-elle importante pour toi ?",
    required: true,
    tip: {
      text: "Confort non négligeable mais cette garantie peut coûter cher. À arbitrer selon tes priorités.",
      icon: "lightbulb",
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
