import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/client";
import { User } from "@/shared/types/user";
import { logger } from "@/backend/infrastructure/utils/logger";

/**
 * Loads the authenticated user from Supabase session with profile data.
 * Returns null if not authenticated or on error.
 */
export async function loadAuthenticatedUser(): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return null;
    }

    // Get profile with credits
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    return {
      id: authUser.id,
      email: authUser.email!,
      fullName: profile?.full_name || authUser.email!.split("@")[0],
      credits: profile?.credits || 0,
      emailVerified: !!authUser.email_confirmed_at,
      createdAt: new Date(authUser.created_at).getTime(),
    };
  } catch (error) {
    logger.error("Error loading authenticated user", error);
    return null;
  }
}

/**
 * Checks if there's an authenticated session (lightweight, no profile fetch).
 * Use this for middleware where you only need to check auth status.
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}
