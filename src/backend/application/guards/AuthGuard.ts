import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "@/backend/application/services/AuthService";
import { User } from "@/shared/types/user";

export interface AuthContext<T = Record<string, string>> {
  user: User;
  accessToken: string;
  params: T;
}

export interface RouteContext<T = Record<string, string>> {
  params: Promise<T>;
}

export type AuthenticatedHandler<T = Record<string, string>> = (
  request: NextRequest,
  context: AuthContext<T>
) => Promise<NextResponse>;

/**
 * AuthGuard - Protects API routes that require authentication
 *
 * Usage:
 * ```
 * export const GET = withAuth(async (request, { user, params }) => {
 *   // user is guaranteed to exist here
 *   return NextResponse.json({ data: user.email, id: params.id });
 * });
 * ```
 */
export function withAuth<T = Record<string, string>>(handler: AuthenticatedHandler<T>) {
  return async (request: NextRequest, routeContext?: RouteContext<T>): Promise<NextResponse> => {
    const params = routeContext?.params ? await routeContext.params : ({} as T);
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("access_token")?.value;

      if (!accessToken) {
        return NextResponse.json(
          { error: "Non authentifié" },
          { status: 401 }
        );
      }

      // For stub: getCurrentUser returns the stored user
      // For Supabase: would validate token and get user from session
      const user = authService.getCurrentUser();

      if (!user) {
        // Try to refresh token
        const refreshToken = cookieStore.get("refresh_token")?.value;

        if (refreshToken) {
          const refreshResult = await authService.refreshSession(refreshToken);

          if (refreshResult.success) {
            cookieStore.set("access_token", refreshResult.session.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 3600,
              path: "/",
            });

            return handler(request, {
              user: refreshResult.user,
              accessToken: refreshResult.session.accessToken,
              params,
            });
          }
        }

        // Clear invalid tokens
        cookieStore.delete("access_token");
        cookieStore.delete("refresh_token");

        return NextResponse.json(
          { error: "Session expirée" },
          { status: 401 }
        );
      }

      return handler(request, { user, accessToken, params });
    } catch (error) {
      console.error("AuthGuard error:", error);
      return NextResponse.json(
        { error: "Erreur d'authentification" },
        { status: 500 }
      );
    }
  };
}

/**
 * Optional auth - passes user if authenticated, null otherwise
 */
export type OptionalAuthHandler = (
  request: NextRequest,
  context: { user: User | null; accessToken: string | null }
) => Promise<NextResponse>;

export function withOptionalAuth(handler: OptionalAuthHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("access_token")?.value;

      if (!accessToken) {
        return handler(request, { user: null, accessToken: null });
      }

      const user = authService.getCurrentUser();
      return handler(request, { user, accessToken: user ? accessToken : null });
    } catch (error) {
      console.error("OptionalAuthGuard error:", error);
      return handler(request, { user: null, accessToken: null });
    }
  };
}
