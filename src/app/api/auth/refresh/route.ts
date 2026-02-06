import { NextResponse } from "next/server";
import { createHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/client";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

export const POST = createHandler(
  async () => {
    try {
      const supabase = await createSupabaseServerClient();

      // Supabase will use the refresh token from cookies automatically
      const { data, error } = await supabase.auth.refreshSession();

      if (error || !data.session) {
        const errorDto: ErrorResponseDto = { error: "Session expirée" };
        return NextResponse.json(errorDto, { status: 401 });
      }

      return NextResponse.json({
        expiresAt: data.session.expires_at! * 1000,
      });
    } catch (error) {
      logger.error("Refresh error", error);
      const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
      return NextResponse.json(errorDto, { status: 500 });
    }
  },
  { csrf: true, rateLimit: RateLimit.GENERAL }
);
