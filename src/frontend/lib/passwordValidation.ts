// Shared password validation rules used across registration and password reset

const MAX_PASSWORD_LENGTH = 128;

export const passwordRequirements = [
  { key: "length", label: "8 caractères minimum", test: (p: string) => p.length >= 8 },
  { key: "maxLength", label: `${MAX_PASSWORD_LENGTH} caractères maximum`, test: (p: string) => p.length <= MAX_PASSWORD_LENGTH },
  { key: "lowercase", label: "Une minuscule", test: (p: string) => /[a-z]/.test(p) },
  { key: "uppercase", label: "Une majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { key: "number", label: "Un chiffre", test: (p: string) => /\d/.test(p) },
  { key: "special", label: "Un caractère spécial", test: (p: string) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(p) },
] as const;

export const passwordRegex = {
  lowercase: /[a-z]/,
  uppercase: /[A-Z]/,
  number: /\d/,
  special: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/,
};

export function isPasswordValid(password: string): boolean {
  return passwordRequirements.every(req => req.test(password));
}
