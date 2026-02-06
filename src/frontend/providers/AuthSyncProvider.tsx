"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import { authKeys } from "@/frontend/queries/auth";

/**
 * Syncs Supabase auth state with React Query cache.
 * When Supabase detects a sign out (session expired, token invalid, etc.),
 * the auth cache is immediately invalidated.
 */
export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          // Clear auth cache immediately when signed out
          queryClient.setQueryData(authKeys.user(), null);
          queryClient.invalidateQueries({ queryKey: authKeys.all });
        } else if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
          // Refetch user data when token refreshed or signed in
          queryClient.invalidateQueries({ queryKey: authKeys.user() });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return <>{children}</>;
}
