export const MAX_PASSWORD_LENGTH = 128;

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  // Simple email regex - RFC 5322 simplified
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function validatePayloadSize(
  payload: unknown,
  maxBytes: number = 100_000
): boolean {
  try {
    const size = new TextEncoder().encode(JSON.stringify(payload)).length;
    return size <= maxBytes;
  } catch {
    return false;
  }
}
