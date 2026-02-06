// Payment error codes returned to frontend
export const PAYMENT_ERROR_CODES = {
  INSUFFICIENT_CREDITS: "INSUFFICIENT_CREDITS",
  PAYMENT_REQUIRED: "PAYMENT_REQUIRED",
  PAYMENT_NOT_VERIFIED: "PAYMENT_NOT_VERIFIED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  INVALID_SESSION: "INVALID_SESSION",
  SESSION_EXPIRED: "SESSION_EXPIRED",
} as const;

export type PaymentErrorCode = (typeof PAYMENT_ERROR_CODES)[keyof typeof PAYMENT_ERROR_CODES];

// User-friendly error messages (French)
export const PAYMENT_ERROR_MESSAGES: Record<PaymentErrorCode, string> = {
  [PAYMENT_ERROR_CODES.INSUFFICIENT_CREDITS]:
    "Vous n'avez pas assez de crédits. Achetez des crédits pour débloquer cette analyse.",
  [PAYMENT_ERROR_CODES.PAYMENT_REQUIRED]:
    "Un paiement est requis pour débloquer cette analyse.",
  [PAYMENT_ERROR_CODES.PAYMENT_NOT_VERIFIED]:
    "Le paiement n'a pas pu être vérifié. Si vous avez payé, veuillez patienter quelques instants et rafraîchir la page.",
  [PAYMENT_ERROR_CODES.PAYMENT_FAILED]:
    "Le paiement a échoué. Veuillez vérifier vos informations de carte et réessayer.",
  [PAYMENT_ERROR_CODES.INVALID_SESSION]:
    "La session de paiement est invalide ou a expiré. Veuillez réessayer.",
  [PAYMENT_ERROR_CODES.SESSION_EXPIRED]:
    "La session de paiement a expiré. Veuillez relancer le paiement.",
};
