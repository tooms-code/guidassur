import {
  IUserService,
  GetAnalysesParams,
  GetAnalysesResult,
  UpdateProfileParams,
} from "@/backend/domain/interfaces/IUserService";
import {
  UserAnalysis,
  UserStats,
  UserSettings,
} from "@/backend/domain/entities/UserAnalysis";
import { InsuranceType, insuranceLabels } from "@/shared/types/insurance";
import { createSupabaseServerClient, createAdminClient } from "./client";
import { logger } from "@/backend/infrastructure/utils/logger";

class SupabaseUserService implements IUserService {
  async getAnalyses(params: GetAnalysesParams): Promise<GetAnalysesResult> {
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("analyses")
      .select("*", { count: "exact" })
      .eq("user_id", params.userId);

    // Filters
    if (params.insuranceType) {
      query = query.eq("insurance_type", params.insuranceType);
    }
    if (params.isUnlocked !== undefined) {
      query = query.eq("is_unlocked", params.isUnlocked);
    }

    // Sorting
    const sortField = params.sortBy || "date";
    const sortOrder = params.sortOrder || "desc";

    switch (sortField) {
      case "date":
        query = query.order("created_at", { ascending: sortOrder === "asc" });
        break;
      case "score":
        query = query.order("score", { ascending: sortOrder === "asc" });
        break;
      case "type":
        query = query.order("insurance_type", { ascending: sortOrder === "asc" });
        break;
    }

    // Pagination
    const offset = params.offset || 0;
    const limit = params.limit || 5;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error("Error fetching analyses", error);
      throw new Error("Erreur lors de la récupération des analyses");
    }

    const analyses: UserAnalysis[] = (data || []).map((a) => ({
      id: a.id,
      insuranceType: a.insurance_type as InsuranceType,
      insuranceLabel: insuranceLabels[a.insurance_type as InsuranceType],
      score: a.score,
      scoreLabel: a.score_label,
      isUnlocked: a.is_unlocked,
      insightsCount: Array.isArray(a.insights) ? a.insights.length : 0,
      potentialSavingsMin: a.total_savings_min,
      potentialSavingsMax: a.total_savings_max,
      createdAt: a.created_at,
    }));

    return {
      analyses,
      total: count || 0,
      limit,
      offset,
      hasMore: offset + limit < (count || 0),
    };
  }

  async getStats(userId: string): Promise<UserStats> {
    const supabase = await createSupabaseServerClient();

    const { data: analyses, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      logger.error("Error fetching stats", error);
      throw new Error("Erreur lors de la récupération des statistiques");
    }

    const analysesByType: Record<InsuranceType, number> = {
      [InsuranceType.AUTO]: 0,
      [InsuranceType.HABITATION]: 0,
      [InsuranceType.GAV]: 0,
      [InsuranceType.MUTUELLE]: 0,
    };

    let totalSavingsMin = 0;
    let totalSavingsMax = 0;
    let totalScore = 0;
    let unlockedCount = 0;

    for (const analysis of analyses || []) {
      const type = analysis.insurance_type as InsuranceType;
      if (analysesByType[type] !== undefined) {
        analysesByType[type]++;
      }

      if (analysis.is_unlocked) {
        unlockedCount++;
        totalSavingsMin += analysis.total_savings_min;
        totalSavingsMax += analysis.total_savings_max;
      }

      totalScore += analysis.score;
    }

    // Generate score evolution from analyses
    const scoreEvolution: { date: string; score: number }[] = [];
    const analysesByMonth = new Map<string, number[]>();

    for (const analysis of analyses || []) {
      const monthKey = analysis.created_at.slice(0, 7);
      if (!analysesByMonth.has(monthKey)) {
        analysesByMonth.set(monthKey, []);
      }
      analysesByMonth.get(monthKey)!.push(analysis.score);
    }

    // Last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const scores = analysesByMonth.get(monthKey) || [];
      const avgScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

      if (avgScore > 0 || scoreEvolution.length > 0) {
        scoreEvolution.push({
          date: monthKey,
          score:
            avgScore ||
            (scoreEvolution.length > 0
              ? scoreEvolution[scoreEvolution.length - 1].score
              : 0),
        });
      }
    }

    return {
      totalAnalyses: analyses?.length || 0,
      unlockedAnalyses: unlockedCount,
      totalPotentialSavingsMin: totalSavingsMin,
      totalPotentialSavingsMax: totalSavingsMax,
      averageScore:
        analyses && analyses.length > 0
          ? Math.round(totalScore / analyses.length)
          : 0,
      analysesByType,
      scoreEvolution,
    };
  }

  async getSettings(userId: string): Promise<UserSettings> {
    const supabase = await createSupabaseServerClient();

    // Get profile, settings, auth user, and MFA status in parallel
    const [profileResult, settingsResult, authResult, mfaResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("user_settings").select("*").eq("user_id", userId).single(),
      supabase.auth.getUser(),
      supabase.auth.mfa.listFactors(),
    ]);

    const profile = profileResult.data;
    const authUser = authResult.data?.user;
    let settings = settingsResult.data;

    // Create settings if not exists
    if (!settings && profile) {
      const { data: newSettings } = await supabase
        .from("user_settings")
        .insert({ user_id: userId })
        .select()
        .single();
      settings = newSettings;
    }

    // Check MFA status from Supabase Auth (source of truth)
    const hasVerifiedMFA = mfaResult.data?.totp?.some(
      (factor) => factor.status === "verified"
    ) || false;

    return {
      email: profile?.email || "",
      fullName: profile?.full_name || "",
      phone: authUser?.phone || "",
      twoFactorEnabled: hasVerifiedMFA,
      emailNotifications: settings?.email_notifications ?? true,
      createdAt: profile ? new Date(profile.created_at).getTime() : Date.now(),
    };
  }

  async updateProfile(params: UpdateProfileParams): Promise<UserSettings> {
    const supabase = await createSupabaseServerClient();

    // Update profile name
    if (params.fullName !== undefined) {
      await supabase
        .from("profiles")
        .update({ full_name: params.fullName })
        .eq("id", params.userId);
    }

    // Update phone via Supabase Auth (stored on auth.users)
    if (params.phone !== undefined) {
      await supabase.auth.updateUser({ phone: params.phone });
    }

    // Update settings
    if (params.emailNotifications !== undefined) {
      await supabase
        .from("user_settings")
        .upsert({
          user_id: params.userId,
          email_notifications: params.emailNotifications,
        })
        .eq("user_id", params.userId);
    }

    return this.getSettings(params.userId);
  }

  async deleteAccount(userId: string): Promise<void> {
    // Use admin client to delete user from auth
    const adminClient = createAdminClient();

    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) {
      logger.error("Error deleting account", error);
      throw new Error("Erreur lors de la suppression du compte");
    }

    // Cascade delete will handle profiles, settings, etc.
  }

  async getCredits(userId: string): Promise<number> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (error) {
      logger.error("Error getting credits", error);
      return 0;
    }

    return data?.credits || 0;
  }

  async addCredits(userId: string, amount: number): Promise<number> {
    // Use admin client to bypass RLS
    const adminClient = createAdminClient();

    const { data, error } = await adminClient.rpc("add_credits", {
      p_user_id: userId,
      p_amount: amount,
    });

    if (error) {
      logger.error("Error adding credits", error);
      throw new Error("Erreur lors de l'ajout des crédits");
    }

    return data || 0;
  }

  async useCredit(userId: string): Promise<{ success: boolean; remaining: number }> {
    // Use admin client to bypass RLS
    const adminClient = createAdminClient();

    const { data, error } = await adminClient.rpc("use_credit", {
      p_user_id: userId,
    });

    if (error) {
      logger.error("Error using credit", error);
      return { success: false, remaining: 0 };
    }

    const result = data?.[0];
    return {
      success: result?.success || false,
      remaining: result?.remaining || 0,
    };
  }
}

export const supabaseUserService = new SupabaseUserService();
