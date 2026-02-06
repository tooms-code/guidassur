import { NextRequest, NextResponse } from "next/server";
import { User } from "@/shared/types/user";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { loadAuthenticatedUser } from "@/backend/infrastructure/api/authUtils";
import { logger } from "@/backend/infrastructure/utils/logger";

export interface AuthContext<T = Record<string, string>> {
  user: User;
  params: T;
}

export interface RouteContext<T = Record<string, string>> {
  params: Promise<T>;
}

export type AuthenticatedHandler<T = Record<string, string>> = (
  request: NextRequest,
  context: AuthContext<T>
) => Promise<NextResponse>;

export function withAuth<T = Record<string, string>>(handler: AuthenticatedHandler<T>) {
  return async (request: NextRequest, routeContext?: RouteContext<T>): Promise<NextResponse> => {
    const params = routeContext?.params ? await routeContext.params : ({} as T);
    try {
      const user = await loadAuthenticatedUser();

      if (!user) {
        const error: ErrorResponseDto = { error: "Non authentifié" };
        return NextResponse.json(error, { status: 401 });
      }

      return handler(request, { user, params });
    } catch (error) {
      logger.error("AuthGuard error", error);
      const errorDto: ErrorResponseDto = { error: "Erreur d'authentification" };
      return NextResponse.json(errorDto, { status: 500 });
    }
  };
}

export type OptionalAuthHandler<T = Record<string, string>> = (
  request: NextRequest,
  context: { user: User | null; params: T }
) => Promise<NextResponse>;

export function withOptionalAuth<T = Record<string, string>>(handler: OptionalAuthHandler<T>) {
  return async (request: NextRequest, routeContext?: RouteContext<T>): Promise<NextResponse> => {
    const params = routeContext?.params ? await routeContext.params : ({} as T);
    try {
      const user = await loadAuthenticatedUser();
      return handler(request, { user, params });
    } catch (error) {
      logger.error("OptionalAuthGuard error", error);
      return handler(request, { user: null, params });
    }
  };
}
