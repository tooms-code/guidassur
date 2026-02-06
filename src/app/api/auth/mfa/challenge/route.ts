import { NextResponse } from "next/server";
import { createHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { authService } from "@/backend/application/services/AuthService";
import { AuthError } from "@/backend/domain/interfaces/IAuthProvider";
import { toAuthResponseDto, ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { handleApiError } from "@/backend/infrastructure/api/errors";
import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/client";

export const POST = createHandler(
  async (request) => {
    try {
      // Verify there's an active authenticated user (validates JWT with Supabase Auth server)
      const supabase = await createSupabaseServerClient();
      const { data: { user: existingUser }, error: userError } = await supabase.auth.getUser();

      if (userError || !existingUser) {
        const error: ErrorResponseDto = { error: "Session invalide. Veuillez vous reconnecter." };
        return NextResponse.json(error, { status: 401 });
      }

      const body = await request.json();
      const { factorId, code } = body;

      if (!factorId || !code) {
        const error: ErrorResponseDto = { error: "factorId et code requis" };
        return NextResponse.json(error, { status: 400 });
      }

      // Verify MFA code (this elevates to AAL2)
      await authService.challengeMFA(factorId, code);

      // Get fresh user and session after MFA verification
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();

      if (!user || !session) {
        const error: ErrorResponseDto = { error: "Session invalide après vérification MFA" };
        return NextResponse.json(error, { status: 401 });
      }

      // Get profile with credits
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const userObj = {
        id: user.id,
        email: user.email!,
        fullName: profile?.full_name || user.email!.split("@")[0],
        credits: profile?.credits || 0,
        emailVerified: !!user.email_confirmed_at,
        createdAt: new Date(user.created_at).getTime(),
      };

      const response = toAuthResponseDto(userObj, session.expires_at! * 1000);
      return NextResponse.json(response);
    } catch (error) {
      if (error instanceof AuthError) {
        const errorDto: ErrorResponseDto = { error: error.message, code: error.code };
        return NextResponse.json(errorDto, { status: 400 });
      }
      return handleApiError(error, "MFA challenge error");
    }
  },
  { rateLimit: RateLimit.MFA, csrf: true }
);
