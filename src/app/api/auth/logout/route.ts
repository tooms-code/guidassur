import { NextResponse } from "next/server";
import { createHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/client";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

export const POST = createHandler(
  async () => {
    try {
      const supabase = await createSupabaseServerClient();

      // Supabase handles cookie cleanup automatically
      await supabase.auth.signOut();

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      logger.error("Logout error", error);
      const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
      return NextResponse.json(errorDto, { status: 500 });
    }
  },
  { csrf: true, rateLimit: RateLimit.AUTH }
);
