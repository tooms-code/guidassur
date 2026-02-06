import { NextResponse } from "next/server";
import { getStripe } from "@/backend/infrastructure/stripe/stripe";
import { PricingData, StripePriceData } from "@/shared/types/pricing";

export const dynamic = "force-dynamic"; // Disable caching at route level (we cache in React Query)

/**
 * GET /api/stripe/prices
 *
 * Fetches all active prices from Stripe with their product information.
 * Filters by metadata.type="credits" (unified type for all credit purchases).
 *
 * Response is cached on the client side using React Query.
 */
export async function GET() {
  try {
    const stripe = getStripe();

    // Fetch all active prices with their product data
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
    });

    // Transform Stripe prices to our clean format
    const formattedPrices: StripePriceData[] = prices.data
      .filter((price) => price.type === "one_time")
      .map((price) => {
        const product = price.product as any; // Stripe types are expanded
        const metadata = product.metadata || {};
        return {
          metadata,
          priceId: price.id, // Keep the price_id for checkout
          amount: (price.unit_amount || 0) / 100,
          credits: parseInt(metadata.credits || "1"),
          popular: metadata.popular === "true",
        };
      })
      .filter((price) => {
        // Only include prices with type="credits" (unified for all credit purchases)
        return price.metadata.type === "credits";
      })
      .map(({ metadata, ...price }) => price); // Remove metadata from final result

    // Sort by credits amount (1, 4, etc.)
    const pricingData: PricingData = {
      prices: formattedPrices.sort((a, b) => a.credits - b.credits),
    };

    return NextResponse.json(pricingData);
  } catch (error) {
    console.error("[STRIPE_PRICES_ERROR]", error);

    // Return error - no fallback, no payment without Stripe
    return NextResponse.json(
      { error: "Impossible de récupérer les prix depuis Stripe" },
      { status: 503 } // Service unavailable
    );
  }
}
