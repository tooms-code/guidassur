import { useQuery } from "@tanstack/react-query";
import { PricingData, transformPriceForDisplay } from "@/shared/types/pricing";

/**
 * Fetches pricing data from Stripe via our API
 * Cached for 1 hour to avoid excessive API calls
 */
export function usePricing() {
  return useQuery({
    queryKey: ["stripe-pricing"],
    queryFn: async (): Promise<PricingData> => {
      const res = await fetch("/api/stripe/prices");
      if (!res.ok) {
        throw new Error("Failed to fetch pricing");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour - prices don't change often
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: 2,
    refetchOnWindowFocus: false, // Don't refetch when user comes back to tab
  });
}

/**
 * Hook that returns all credit prices
 */
export function useCreditPrices() {
  const { data, isLoading, error } = usePricing();

  if (!data?.prices || data.prices.length === 0) {
    return {
      prices: [],
      isLoading,
      error,
    };
  }

  return {
    prices: data.prices.map((price) => ({
      ...price,
      display: transformPriceForDisplay(price),
    })),
    isLoading,
    error,
  };
}

// Backward compatibility: Get 1 credit price (for unlock)
export function useUnlockPrice() {
  const { prices, isLoading, error } = useCreditPrices();
  const unlockPrice = prices.find((p) => p.credits === 1);

  return {
    price: unlockPrice || null,
    display: unlockPrice || null,
    priceId: unlockPrice?.priceId || null,
    isLoading,
    error,
  };
}

// Backward compatibility: Get multi-credit packs
export function useCreditPacks() {
  const { prices, isLoading, error } = useCreditPrices();
  const packs = prices.filter((p) => p.credits > 1);

  return {
    packs: packs.map((pack) => ({
      price: pack,
      display: pack.display,
      priceId: pack.priceId,
    })),
    isLoading,
    error,
  };
}
