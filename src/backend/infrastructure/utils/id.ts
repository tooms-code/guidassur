/**
 * Generates a UUID v4 using the native crypto API
 * @returns A UUID v4 string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 */
export function generateId(): string {
  return crypto.randomUUID();
}
