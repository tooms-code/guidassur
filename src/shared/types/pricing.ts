export type PriceType = "unlock" | "credits";

export interface PriceMetadata {
  type: PriceType;
  credits?: string; // For credit packs
  badge?: string; // "PROMO -50%", "POPULAIRE", etc.
  old_price?: string; // For strikethrough pricing
  popular?: string; // "true" for highlighting
  features?: string; // JSON stringified array
}

export interface StripePriceData {
  priceId: string; // Stripe price_id for checkout
  amount: number; // in euros
  credits: number;
  popular?: boolean;
}

export interface PricingData {
  prices: StripePriceData[]; // All credit prices (1, 4, etc.)
}

export interface PricingDisplayData {
  priceId: string;
  amount: number; // in euros
  credits: number;
  popular?: boolean;
}

// Helper to transform Stripe price to display format (now it's just a passthrough)
export function transformPriceForDisplay(price: StripePriceData): PricingDisplayData {
  return price; // Already in the right format!
}
