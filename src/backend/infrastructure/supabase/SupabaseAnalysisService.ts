import { analysisEngine } from "@/backend/infrastructure/factories/analysisEngineFactory";
import { AnalysisResult } from "@/backend/domain/entities/AnalysisResult";
import { InsuranceType } from "@/shared/types/insurance";
import { createAdminClient, createSupabaseServerClient } from "./client";
import { logger } from "@/backend/infrastructure/utils/logger";
import type { Insight } from "@/backend/domain/entities/Insight";
import type { Json, Analysis } from "./types";

export interface GenerateAnalysisParams {
  sessionId: string;
  insuranceType: InsuranceType;
  answers: Record<string, unknown>;
  userId?: string;
  persist?: boolean;
  existingId?: string;
}

class SupabaseAnalysisService {
  async generate(params: GenerateAnalysisParams): Promise<AnalysisResult> {
    const {
      sessionId,
      insuranceType,
      answers,
      userId,
      persist = true,
      existingId,
    } = params;

    // Generate the analysis using the engine (pure logic)
    const analysis = analysisEngine.analyze(
      sessionId,
      insuranceType,
      answers,
      existingId
    );

    const fullAnalysis: AnalysisResult = {
      ...analysis,
      userId,
      isUnlocked: false,
      answers: persist ? answers : undefined,
    };

    // Persist to Supabase if requested
    if (persist) {
      const adminClient = createAdminClient();

      const insertData = {
        id: fullAnalysis.id,
        user_id: userId || null,
        insurance_type: insuranceType,
        answers: answers as Json,
        score: fullAnalysis.score,
        score_label: fullAnalysis.scoreLabel,
        insights: fullAnalysis.insights as unknown as Json,
        total_savings_min: fullAnalysis.totalSavings.min,
        total_savings_max: fullAnalysis.totalSavings.max,
        is_unlocked: false,
      };

      const { error } = await adminClient.from("analyses").insert(insertData);

      if (error) {
        logger.error("Error persisting analysis", error);
        // Continue - analysis was generated, just not persisted
      }
    }

    return fullAnalysis;
  }

  async getById(analysisId: string): Promise<AnalysisResult | null> {
    // Use adminClient - authorization is handled by route handlers, not RLS
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("analyses")
      .select("*")
      .eq("id", analysisId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.toAnalysisResult(data);
  }

  async getBySessionId(sessionId: string): Promise<AnalysisResult | null> {
    // Session ID is the analysis ID in our case
    return this.getById(sessionId);
  }

  async getUserAnalyses(userId: string): Promise<AnalysisResult[]> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error getting user analyses", error);
      return [];
    }

    return (data || []).map((row) => this.toAnalysisResult(row));
  }

  async unlockAnalysis(analysisId: string): Promise<AnalysisResult | null> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("analyses")
      .update({ is_unlocked: true })
      .eq("id", analysisId)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error unlocking analysis", error);
      return null;
    }

    return this.toAnalysisResult(data);
  }

  async saveToUser(
    analysisId: string,
    userId: string,
    answers?: Record<string, unknown>
  ): Promise<AnalysisResult | null> {
    const adminClient = createAdminClient();

    const updateData: Record<string, unknown> = { user_id: userId };
    if (answers) {
      updateData.answers = answers;
    }

    const { data, error } = await adminClient
      .from("analyses")
      .update(updateData)
      .eq("id", analysisId)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error saving analysis to user", error);
      return null;
    }

    return this.toAnalysisResult(data);
  }

  async isOwnedByUser(analysisId: string, userId: string): Promise<boolean> {
    const supabase = await createSupabaseServerClient();

    const { data } = await supabase
      .from("analyses")
      .select("user_id")
      .eq("id", analysisId)
      .single();

    return data?.user_id === userId;
  }

  private toAnalysisResult(data: Analysis): AnalysisResult {
    // Parse insights from JSON - data.insights is stored as Json type
    const insights: Insight[] = Array.isArray(data.insights)
      ? (data.insights as unknown as Insight[])
      : [];

    // Calculate savings breakdown from insights
    const savingsBreakdown = insights
      .filter((i) => i.savingsImpact != null)
      .map((i) => ({
        category: i.category,
        min: i.savingsImpact?.min || 0,
        max: i.savingsImpact?.max || 0,
        description: i.content.title,
      }));

    return {
      id: data.id,
      sessionId: data.id, // Using id as sessionId for simplicity
      insuranceType: data.insurance_type as InsuranceType,
      score: data.score,
      scoreLabel: data.score_label as AnalysisResult["scoreLabel"],
      insights,
      totalSavings: {
        min: data.total_savings_min,
        max: data.total_savings_max,
      },
      savingsBreakdown,
      createdAt: new Date(data.created_at).getTime(),
      userId: data.user_id || undefined,
      isUnlocked: data.is_unlocked,
      answers: data.answers as Record<string, unknown> | undefined,
    };
  }
}

export const supabaseAnalysisService = new SupabaseAnalysisService();
