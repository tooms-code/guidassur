/**
 * Returns the text color class based on score value
 * @param score - Score value (0-100)
 */
export function getScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-500";
}

/**
 * Returns the background and border color classes based on score value
 * @param score - Score value (0-100)
 */
export function getScoreCardColor(score: number): string {
  if (score >= 75) return "bg-emerald-50 border-emerald-100";
  if (score >= 50) return "bg-amber-50 border-amber-100";
  return "bg-red-50 border-red-100";
}

/**
 * Formats a date string to French locale
 * @param dateStr - ISO date string
 * @param options - Intl.DateTimeFormatOptions
 */
export function formatDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", options);
}

/**
 * Formats a price with euro symbol
 * @param price - Price value
 * @param decimals - Number of decimal places (default: 0)
 */
export function formatPrice(price: number, decimals = 0): string {
  return `${price.toFixed(decimals)}€`;
}

/**
 * Formats a price range
 * @param min - Minimum price
 * @param max - Maximum price
 */
export function formatPriceRange(min: number, max: number): string {
  return `${min}€ - ${max}€`;
}

/**
 * Formats a date string to French locale with time
 * @param dateStr - ISO date string
 */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats a timestamp as relative time (e.g., "il y a 5 minutes")
 * @param timestamp - Unix timestamp in milliseconds
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} jours`;
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}
