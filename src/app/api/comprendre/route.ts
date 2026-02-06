import { NextResponse } from "next/server";
import {
  COMPRENDRE_TABS,
  GARANTIES_INTRO,
  INSURANCE_ACCORDIONS,
  PITFALLS,
  VIGILANCE_POINTS,
  FRANCHISE_INTRO,
  FRANCHISE_TYPES,
  FRANCHISE_ADVICE,
  RENEGOTIATION_TIMING,
  NEGOTIATION_CHECKLIST,
  DISCLAIMER,
  CTA_CONTENT,
} from "@/frontend/constants/comprendre";

// This route serves the comprendre page content
// In the future, this data could come from a database (CMS, Prisma, etc.)

export async function GET() {
  // Serialize the data (icons are converted to their names for JSON transport)
  const serializeWithIcons = <T extends { icon?: unknown }>(items: T[]) =>
    items.map((item) => ({
      ...item,
      icon: item.icon ? (item.icon as { name?: string }).name || "Circle" : undefined,
    }));

  const data = {
    tabs: COMPRENDRE_TABS.map((tab) => ({
      ...tab,
      icon: (tab.icon as { name?: string }).name || "Circle",
    })),
    garanties: {
      intro: GARANTIES_INTRO,
      accordions: INSURANCE_ACCORDIONS.map((acc) => ({
        ...acc,
        icon: (acc.icon as { name?: string }).name || "Circle",
      })),
    },
    pieges: {
      pitfalls: PITFALLS,
      vigilancePoints: serializeWithIcons(VIGILANCE_POINTS),
    },
    franchises: {
      intro: FRANCHISE_INTRO,
      types: FRANCHISE_TYPES,
      advice: {
        ...FRANCHISE_ADVICE,
        tips: serializeWithIcons(FRANCHISE_ADVICE.tips),
      },
    },
    renegocier: {
      timing: {
        ...RENEGOTIATION_TIMING,
        situations: serializeWithIcons(RENEGOTIATION_TIMING.situations),
      },
      checklist: serializeWithIcons(NEGOTIATION_CHECKLIST),
    },
    disclaimer: DISCLAIMER,
    cta: CTA_CONTENT,
  };

  return NextResponse.json(data);
}
