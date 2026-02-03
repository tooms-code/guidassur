import { QuestionConfig } from "@/shared/types/questionnaire";

export const autoQuestions: QuestionConfig[] = [
  // Step: Ton contrat
  {
    id: "prime_annuelle",
    step: "Ton contrat",
    type: "number",
    label: "Combien paies-tu par an pour ton assurance auto ?",
    unit: "€",
    required: true,
    placeholder: "850",
    tip: {
      text: "Tu le trouves sur ton échéancier ou ton espace client. C'est le montant total que tu paies sur l'année.",
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
    placeholder: "300",
    tip: {
      text: "C'est ce qui reste à ta charge en cas de sinistre. Une franchise haute = prime plus basse, mais plus de risque pour toi.",
      icon: "lightbulb",
    },
  },
  {
    id: "formule",
    step: "Ton contrat",
    type: "single-choice",
    label: "Quelle est ta formule d'assurance ?",
    required: true,
    options: [
      { value: "tiers", label: "Tiers" },
      { value: "tiers_plus", label: "Tiers+" },
      { value: "tous_risques", label: "Tous risques" },
    ],
    tip: {
      text: "Tiers = minimum légal (dommages aux autres). Tous risques = tu es couvert même si tu es responsable.",
      icon: "info",
    },
  },
  {
    id: "options_garanties",
    step: "Ton contrat",
    type: "multi-choice",
    label: "Quelles garanties as-tu dans ton contrat ?",
    required: false,
    options: [
      { value: "bris_glace", label: "Bris de glace" },
      { value: "vol", label: "Vol" },
      { value: "incendie", label: "Incendie" },
      { value: "assistance_0km", label: "Assistance 0km" },
      { value: "vehicule_remplacement", label: "Véhicule de remplacement" },
      { value: "protection_juridique", label: "Protection juridique" },
      { value: "panne_mecanique", label: "Panne mécanique" },
      { value: "contenu_vehicule", label: "Contenu du véhicule" },
    ],
    tip: {
      text: "Coche les garanties présentes dans ton contrat. Si tu ne sais pas, vérifie tes conditions particulières.",
      icon: "info",
    },
  },
  {
    id: "franchise_bris_glace",
    step: "Ton contrat",
    type: "number",
    label: "Quelle est ta franchise bris de glace ?",
    unit: "€",
    required: false,
    placeholder: "100",
    dependsOn: { questionId: "options_garanties", contains: "bris_glace" },
    tip: {
      text: "Souvent entre 0€ et 150€. Une franchise à 0€ coûte plus cher mais évite les mauvaises surprises.",
      icon: "money",
    },
  },

  // Step: Ton véhicule
  {
    id: "type_vehicule",
    step: "Ton véhicule",
    type: "single-choice",
    label: "Quel type de véhicule assures-tu ?",
    required: true,
    options: [
      { value: "citadine", label: "Citadine" },
      { value: "berline", label: "Berline" },
      { value: "suv", label: "SUV" },
      { value: "moto", label: "Moto" },
    ],
  },
  {
    id: "annee_circulation",
    step: "Ton véhicule",
    type: "number",
    label: "Quelle est l'année de première mise en circulation ?",
    required: true,
    placeholder: "2018",
    min: 1990,
    max: 2025,
    tip: {
      text: "C'est la date de première mise en circulation, visible sur ta carte grise (case B).",
      icon: "info",
    },
  },
  {
    id: "kilometrage_actuel",
    step: "Ton véhicule",
    type: "single-choice",
    label: "Quel est le kilométrage actuel de ton véhicule ?",
    required: true,
    options: [
      { value: "moins_50k", label: "< 50 000 km" },
      { value: "50k_150k", label: "50 000 - 150 000 km" },
      { value: "plus_150k", label: "> 150 000 km" },
    ],
    tip: {
      text: "Un véhicule à fort kilométrage peut justifier de réduire certaines garanties.",
      icon: "lightbulb",
    },
  },
  {
    id: "kilometrage_annuel",
    step: "Ton véhicule",
    type: "single-choice",
    label: "Combien de kilomètres parcours-tu par an ?",
    required: true,
    options: [
      { value: "moins_10k", label: "< 10 000 km/an" },
      { value: "10k_20k", label: "10 000 - 20 000 km/an" },
      { value: "plus_20k", label: "> 20 000 km/an" },
    ],
    tip: {
      text: "Plus tu roules, plus le risque est élevé. Certains contrats ont des forfaits km.",
      icon: "info",
    },
  },
  {
    id: "lieu_stationnement",
    step: "Ton véhicule",
    type: "single-choice",
    label: "Où stationnes-tu ton véhicule la nuit ?",
    required: true,
    options: [
      { value: "garage_ferme", label: "Garage fermé" },
      { value: "parking_couvert", label: "Parking couvert" },
      { value: "parking_exterieur", label: "Parking extérieur" },
      { value: "voie_publique", label: "Voie publique" },
    ],
    tip: {
      text: "Un garage fermé réduit le risque de vol et peut baisser ta prime.",
      icon: "money",
    },
  },
  {
    id: "usage_vehicule",
    step: "Ton véhicule",
    type: "single-choice",
    label: "Quel est l'usage principal de ton véhicule ?",
    required: true,
    options: [
      { value: "personnel_occasionnel", label: "Personnel occasionnel" },
      { value: "domicile_travail", label: "Domicile-travail" },
      { value: "longs_trajets", label: "Longs trajets fréquents" },
      { value: "quotidien_intensif", label: "Usage quotidien intensif" },
    ],
    tip: {
      text: "L'usage déclaré doit correspondre à la réalité, sinon tu risques un refus d'indemnisation.",
      icon: "alert",
    },
  },

  // Step: Ton profil conducteur
  {
    id: "age_conducteur",
    step: "Ton profil",
    type: "number",
    label: "Quel âge as-tu ?",
    required: true,
    min: 18,
    max: 99,
    placeholder: "35",
    tip: {
      text: "Les jeunes conducteurs (-25 ans) et seniors (+70 ans) paient souvent plus cher.",
      icon: "info",
    },
  },
  {
    id: "annees_permis",
    step: "Ton profil",
    type: "number",
    label: "Depuis combien d'années as-tu le permis ?",
    required: true,
    min: 0,
    max: 80,
    placeholder: "10",
    tip: {
      text: "Après 3 ans sans sinistre responsable, tu n'es plus considéré comme jeune conducteur.",
      icon: "lightbulb",
    },
  },
  {
    id: "conducteurs_secondaires",
    step: "Ton profil",
    type: "yes-no",
    label: "Y a-t-il des conducteurs secondaires déclarés ?",
    required: true,
    tip: {
      text: "Un conducteur non déclaré qui a un accident = potentiel refus de prise en charge.",
      icon: "alert",
    },
  },
  {
    id: "credit_auto",
    step: "Ton profil",
    type: "yes-no",
    label: "Ton véhicule est-il financé par un crédit ?",
    required: true,
    tip: {
      text: "Si ton véhicule est financé, l'organisme peut exiger une assurance tous risques.",
      icon: "info",
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
