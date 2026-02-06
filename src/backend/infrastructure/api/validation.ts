import { MAX_PASSWORD_LENGTH } from "./inputValidation";

export function isValidPassword(password: string): { valid: boolean; error?: string } {
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { valid: false, error: `Le mot de passe ne doit pas dépasser ${MAX_PASSWORD_LENGTH} caractères` };
  }
  if (password.length < 8) {
    return { valid: false, error: "Le mot de passe doit contenir au moins 8 caractères" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Le mot de passe doit contenir une minuscule" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Le mot de passe doit contenir une majuscule" };
  }
  if (!/\d/.test(password)) {
    return { valid: false, error: "Le mot de passe doit contenir un chiffre" };
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(password)) {
    return { valid: false, error: "Le mot de passe doit contenir un caractère spécial" };
  }
  return { valid: true };
}

/**
 * Validates age and license years coherence for auto insurance
 */
export function validateAutoAnswers(answers: Record<string, unknown>): { valid: boolean; error?: string } {
  const age = Number(answers.age_conducteur);
  const anneesPermis = Number(answers.annees_permis);

  // Only validate if both values are present
  if (!age || !anneesPermis) {
    return { valid: true };
  }

  // Calculate the minimum age at which the person got their license
  const ageObtentionPermis = age - anneesPermis;

  // Minimum age for license is 16 (conduite accompagnée) or 18 (normal)
  // We allow 16 to be flexible with conduite accompagnée
  if (ageObtentionPermis < 16) {
    return {
      valid: false,
      error: "L'âge et les années de permis ne sont pas cohérents. Vérifie que tu as bien renseigné ton âge actuel et le nombre d'années depuis l'obtention de ton permis (tu peux inclure la conduite accompagnée).",
    };
  }

  // If the person would have gotten license at 16-17, it's probably conduite accompagnée
  // If at 18+, it's normal
  // Both are valid
  return { valid: true };
}
