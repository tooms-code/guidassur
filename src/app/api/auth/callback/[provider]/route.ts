import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/client";
import { logger } from "@/backend/infrastructure/utils/logger";

// Validate redirect URL to prevent open redirect attacks
function validateRedirectUrl(url: string): string {
  // Block encoded characters that could bypass checks (%2F, %5C, etc.)
  if (url.includes("%") || url.includes("\\")) {
    return "/compte";
  }
  // Only allow relative paths starting with /
  if (!url.startsWith("/") || url.startsWith("//")) {
    return "/compte";
  }
  // Block any protocol attempts
  if (url.includes(":")) {
    return "/compte";
  }
  // Block path traversal
  if (url.includes("..")) {
    return "/compte";
  }
  // Normalize and validate via URL constructor
  try {
    const normalized = new URL(url, "http://localhost");
    const normalizedPath = normalized.pathname;
    // Whitelist allowed paths
    const allowedPaths = ["/compte", "/resultat", "/questionnaire", "/comprendre"];
    if (allowedPaths.some(p => normalizedPath === p || normalizedPath.startsWith(p + "/"))) {
      return normalizedPath + normalized.search;
    }
  } catch {
    return "/compte";
  }
  return "/compte";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const code = request.nextUrl.searchParams.get("code");
  const rawNext = request.nextUrl.searchParams.get("next") ?? "/compte";
  const next = validateRedirectUrl(rawNext);

  try {
    if (provider !== "google" && provider !== "facebook") {
      return NextResponse.redirect(new URL("/login?error=invalid_provider", request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/login?error=no_code", request.url));
    }

    const supabase = await createSupabaseServerClient();

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error("OAuth callback error", error, { provider });
      return NextResponse.redirect(new URL("/login?error=auth_error", request.url));
    }

    // Redirect to the intended destination
    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    logger.error("OAuth callback error", error, { provider });
    return NextResponse.redirect(new URL("/login?error=server_error", request.url));
  }
}
