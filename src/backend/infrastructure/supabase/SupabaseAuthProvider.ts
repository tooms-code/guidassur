import {
  IAuthProvider,
  AuthProvider,
  AuthResult,
  AuthError,
  MFAEnrollResult,
  RefreshResult,
} from "@/backend/domain/interfaces/IAuthProvider";
import { User } from "@/shared/types/user";
import { createSupabaseServerClient, createAdminClient } from "./client";
import { logger } from "@/backend/infrastructure/utils/logger";

class SupabaseAuthProvider implements IAuthProvider {
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error("Supabase signIn error", error);
      if (error.message.includes("Invalid login credentials")) {
        throw new AuthError("invalid_credentials", "Email ou mot de passe incorrect");
      }
      throw new AuthError("auth_error", "Erreur de connexion");
    }

    if (!data.user || !data.session) {
      throw new AuthError("auth_error", "Erreur de connexion");
    }

    // Get profile with credits
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      fullName: profile?.full_name || data.user.email!.split("@")[0],
      credits: profile?.credits || 0,
      emailVerified: !!data.user.email_confirmed_at,
      createdAt: new Date(data.user.created_at).getTime(),
    };

    return {
      user,
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at! * 1000,
      },
    };
  }

  async signInWithProvider(provider: AuthProvider): Promise<AuthResult> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as "google" | "facebook",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/${provider}`,
      },
    });

    if (error) {
      logger.error("Supabase OAuth error", error);
      throw new AuthError("oauth_error", "Erreur de connexion OAuth");
    }

    // OAuth returns a URL to redirect to - handled differently
    // Return a placeholder that the route handler will use
    return {
      user: null as unknown as User,
      session: {
        accessToken: data.url || "",
        refreshToken: "",
        expiresAt: 0,
      },
    };
  }

  async signUp(email: string, password: string, fullName?: string): Promise<AuthResult> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      logger.error("Supabase signUp error", error);
      if (error.message.includes("already registered")) {
        throw new AuthError("email_exists", "Cet email est déjà utilisé");
      }
      throw new AuthError("auth_error", "Erreur lors de l'inscription");
    }

    if (!data.user || !data.session) {
      throw new AuthError("auth_error", "Erreur lors de l'inscription");
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      fullName: fullName || data.user.email!.split("@")[0],
      credits: 0,
      emailVerified: !!data.user.email_confirmed_at,
      createdAt: new Date(data.user.created_at).getTime(),
    };

    return {
      user,
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at! * 1000,
      },
    };
  }

  async signOut(): Promise<void> {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  getCurrentUser(): User | null {
    // This is sync in the interface but Supabase is async
    // We handle this at the service level
    return null;
  }

  async getCurrentUserAsync(): Promise<User | null> {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Get profile with credits
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email!,
      fullName: profile?.full_name || user.email!.split("@")[0],
      credits: profile?.credits || 0,
      emailVerified: !!user.email_confirmed_at,
      createdAt: new Date(user.created_at).getTime(),
    };
  }

  async refreshSession(refreshToken: string): Promise<RefreshResult> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      throw new AuthError("refresh_error", "Impossible de rafraîchir la session");
    }

    // Get profile with credits
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      fullName: profile?.full_name || data.user.email!.split("@")[0],
      credits: profile?.credits || 0,
      emailVerified: !!data.user.email_confirmed_at,
      createdAt: new Date(data.user.created_at).getTime(),
    };

    return {
      user,
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at! * 1000,
      },
    };
  }

  /**
   * Change the user's password.
   * Limitation Supabase: verifies the current password via signInWithPassword
   * (re-authentication), which creates a new session. There is no dedicated
   * "verify password" API in Supabase Auth.
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const supabase = await createSupabaseServerClient();

    // Verify current password by re-authenticating
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      throw new AuthError("auth_error", "Non authentifié");
    }

    // Try to sign in with current password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (verifyError) {
      throw new AuthError("invalid_password", "Mot de passe actuel incorrect");
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      logger.error("Password update error", error);
      throw new AuthError("auth_error", "Erreur lors du changement de mot de passe");
    }
  }

  async resetPassword(email: string): Promise<void> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
      logger.error("Password reset error", error);
      // Don't expose whether email exists
    }
  }

  async getMFAStatus(): Promise<{ enabled: boolean; factorId?: string; pendingFactorId?: string }> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error) {
      return { enabled: false };
    }

    const verifiedFactor = data.totp.find((f) => f.status === "verified");
    const unverifiedFactor = data.totp.find((f) => (f.status as string) !== "verified");

    return {
      enabled: !!verifiedFactor,
      factorId: verifiedFactor?.id,
      pendingFactorId: unverifiedFactor?.id,
    };
  }

  async enrollMFA(): Promise<MFAEnrollResult> {
    const supabase = await createSupabaseServerClient();

    // List existing factors and unenroll unverified ones (abandoned enrollments)
    // Per Supabase docs: unverified factors can be unenrolled with AAL1
    const { data: factors } = await supabase.auth.mfa.listFactors();

    if (factors?.totp) {
      for (const factor of factors.totp) {
        // Only unenroll unverified factors (status !== 'verified')
        if ((factor.status as string) !== "verified") {
          const { error: unenrollError } = await supabase.auth.mfa.unenroll({
            factorId: factor.id,
          });
          if (unenrollError) {
            logger.warn("Failed to unenroll factor", { factorId: factor.id, error: unenrollError.message });
          } else {
            logger.info("Unenrolled unverified factor", { factorId: factor.id });
          }
        }
      }
    }

    // Now enroll fresh
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Guidassur",
      issuer: "Guidassur",
    });

    if (error) {
      logger.error("MFA enroll error", error);
      throw new AuthError("mfa_error", "Erreur lors de l'activation du MFA");
    }

    return {
      factorId: data.id,
      secret: data.totp.secret,
      qrCode: data.totp.qr_code,
    };
  }

  async verifyMFA(factorId: string, code: string): Promise<void> {
    const supabase = await createSupabaseServerClient();

    const { data: challenge } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (!challenge) {
      throw new AuthError("mfa_error", "Impossible de créer le challenge MFA");
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    if (error) {
      throw new AuthError("invalid_code", "Code invalide");
    }
  }

  async unenrollMFA(factorId: string, code: string): Promise<void> {
    // First verify the code
    await this.verifyMFA(factorId, code);

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.mfa.unenroll({
      factorId,
    });

    if (error) {
      logger.error("MFA unenroll error", error);
      throw new AuthError("mfa_error", "Erreur lors de la désactivation du MFA");
    }
  }

  /**
   * Verify the user's current password.
   * Limitation Supabase: uses signInWithPassword for verification, which
   * creates a new session as a side effect. There is no dedicated password
   * verification endpoint in Supabase Auth.
   */
  async verifyPassword(password: string): Promise<boolean> {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return false;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    return !error;
  }

  async getAALStatus(): Promise<{ currentLevel: string; nextLevel: string }> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (error) {
      return { currentLevel: "aal1", nextLevel: "aal1" };
    }

    return {
      currentLevel: data.currentLevel || "aal1",
      nextLevel: data.nextLevel || "aal1",
    };
  }

  async challengeMFA(factorId: string, code: string): Promise<void> {
    const supabase = await createSupabaseServerClient();

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError || !challenge) {
      throw new AuthError("mfa_error", "Impossible de créer le challenge MFA");
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    if (error) {
      throw new AuthError("invalid_code", "Code invalide");
    }
  }
}

export const supabaseAuthProvider = new SupabaseAuthProvider();
