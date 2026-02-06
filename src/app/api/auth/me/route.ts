import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/client";
import {
  MeResponseDto,
  toUserDto,
  ErrorResponseDto,
} from "@/backend/application/dtos/auth.dto";
import { logger } from "@/backend/infrastructure/utils/logger";
import { User } from "@/shared/types/user";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Get user from Supabase session (uses cookies automatically)
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      const response: MeResponseDto = { user: null };
      return NextResponse.json(response);
    }

    // Check AAL level - if MFA is enabled but not verified, sign out and return null
    // This prevents MFA bypass by page refresh
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aalData && aalData.nextLevel === "aal2" && aalData.currentLevel !== "aal2") {
      // User has MFA enabled but hasn't completed verification - sign out
      await supabase.auth.signOut();
      const response: MeResponseDto = { user: null };
      return NextResponse.json(response);
    }

    // Get profile with credits
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    const user: User = {
      id: authUser.id,
      email: authUser.email!,
      fullName: profile?.full_name || authUser.email!.split("@")[0],
      credits: profile?.credits || 0,
      emailVerified: !!authUser.email_confirmed_at,
      createdAt: new Date(authUser.created_at).getTime(),
    };

    const response: MeResponseDto = { user: toUserDto(user) };
    return NextResponse.json(response);
  } catch (error) {
    logger.error("Get user error", error);
    const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
    return NextResponse.json(errorDto, { status: 500 });
  }
}
