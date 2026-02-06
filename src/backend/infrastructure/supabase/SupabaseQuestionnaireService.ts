import {
  IQuestionnaireService,
  StartParams,
  StartResult,
  NextResult,
  PrevResult,
  CompleteResult,
  SaveDraftResult,
  GetUserDraftsResult,
  ResumeResult,
} from "@/backend/domain/interfaces/IQuestionnaireService";
import { QuestionnaireSession } from "@/backend/domain/entities/QuestionnaireSession";
import {
  Question,
  Progress,
  QuestionConfig,
  InsuranceType as QuestionnaireInsuranceType,
} from "@/shared/types/questionnaire";
import { InsuranceType as AnalysisInsuranceType } from "@/shared/types/insurance";
import { getQuestionsForType } from "@/backend/infrastructure/config/questions";
import { createAdminClient, createSupabaseServerClient } from "./client";
import { supabaseAnalysisService } from "./SupabaseAnalysisService";
import { logger } from "@/backend/infrastructure/utils/logger";
import { validateAutoAnswers } from "@/backend/infrastructure/api/validation";
import type { Json, QuestionnaireSession as QuestionnaireSessionRow } from "./types";

class SupabaseQuestionnaireService implements IQuestionnaireService {
  // =============================================
  // Start a new questionnaire session
  // =============================================
  async start(params: StartParams): Promise<StartResult> {
    const { type, userId, initialPrice } = params;
    const questions = getQuestionsForType(type);

    if (questions.length === 0) {
      throw new Error(`No questions found for insurance type: ${type}`);
    }

    const adminClient = createAdminClient();

    // Initialize answers with initial price if provided
    const initialAnswers: Record<string, unknown> = {};
    if (initialPrice !== undefined) {
      initialAnswers.prime_annuelle = initialPrice;
    }

    // Create session in database
    const { data, error } = await adminClient
      .from("questionnaire_sessions")
      .insert({
        user_id: userId || null,
        insurance_type: type,
        answers: initialAnswers as Json,
        current_question_index: 0,
        is_completed: false,
      })
      .select()
      .single();

    if (error || !data) {
      logger.error("Error creating questionnaire session", error);
      throw new Error("Impossible de démarrer le questionnaire");
    }

    const firstQuestion = this.toQuestion(questions[0], initialAnswers);

    return {
      sessionId: data.id,
      question: firstQuestion,
      progress: this.calculateProgress(0, questions, type),
    };
  }

  // =============================================
  // Move to next question
  // =============================================
  async next(
    sessionId: string,
    questionId: string,
    answer: unknown
  ): Promise<NextResult> {
    const adminClient = createAdminClient();

    // Get current session
    const { data: session, error } = await adminClient
      .from("questionnaire_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      throw new Error("Session non trouvée");
    }

    const type = session.insurance_type as QuestionnaireInsuranceType;
    const questions = getQuestionsForType(type);
    const answers = (session.answers as Record<string, unknown>) || {};

    // Save the answer
    answers[questionId] = answer;

    // Validate answers for auto insurance (age/license coherence)
    if (type === "auto") {
      const validation = validateAutoAnswers(answers);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }

    // Find next applicable question
    let nextIndex = session.current_question_index + 1;
    while (nextIndex < questions.length) {
      const nextQ = questions[nextIndex];
      if (this.isQuestionApplicable(nextQ, answers)) {
        break;
      }
      nextIndex++;
    }

    // Check if questionnaire is complete
    const isComplete = nextIndex >= questions.length;

    // Update session
    await adminClient
      .from("questionnaire_sessions")
      .update({
        answers: answers as Json,
        current_question_index: nextIndex,
        is_completed: isComplete,
      })
      .eq("id", sessionId);

    if (isComplete) {
      // Check if all required questions are answered
      const canComplete = this.canComplete(questions, answers);
      return { complete: true, canComplete };
    }

    const nextQuestion = this.toQuestion(questions[nextIndex], answers);

    return {
      question: nextQuestion,
      progress: this.calculateProgress(nextIndex, questions, type),
    };
  }

  // =============================================
  // Move to previous question
  // =============================================
  async prev(sessionId: string): Promise<PrevResult> {
    const adminClient = createAdminClient();

    const { data: session, error } = await adminClient
      .from("questionnaire_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      throw new Error("Session non trouvée");
    }

    const type = session.insurance_type as QuestionnaireInsuranceType;
    const questions = getQuestionsForType(type);
    const answers = (session.answers as Record<string, unknown>) || {};

    // Find previous applicable question
    let prevIndex = session.current_question_index - 1;
    while (prevIndex >= 0) {
      const prevQ = questions[prevIndex];
      if (this.isQuestionApplicable(prevQ, answers)) {
        break;
      }
      prevIndex--;
    }

    // Don't go below 0
    if (prevIndex < 0) {
      prevIndex = 0;
    }

    // Update session
    await adminClient
      .from("questionnaire_sessions")
      .update({
        current_question_index: prevIndex,
        is_completed: false,
      })
      .eq("id", sessionId);

    const prevQuestion = this.toQuestion(questions[prevIndex], answers);

    return {
      question: prevQuestion,
      progress: this.calculateProgress(prevIndex, questions, type),
    };
  }

  // =============================================
  // Complete questionnaire and generate analysis
  // =============================================
  async complete(sessionId: string): Promise<CompleteResult> {
    const adminClient = createAdminClient();

    const { data: session, error } = await adminClient
      .from("questionnaire_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      throw new Error("Session non trouvée");
    }

    const typeString = session.insurance_type as string;
    const answers = (session.answers as Record<string, unknown>) || {};

    // Convert string to enum for analysis service
    const insuranceTypeEnum = typeString as AnalysisInsuranceType;

    // Generate analysis
    const analysis = await supabaseAnalysisService.generate({
      sessionId,
      insuranceType: insuranceTypeEnum,
      answers,
      userId: session.user_id || undefined,
      persist: true,
    });

    // Mark session as completed with analysis reference
    await adminClient
      .from("questionnaire_sessions")
      .update({
        is_completed: true,
      })
      .eq("id", sessionId);

    return {
      analysisId: analysis.id,
      analysis,
      insuranceType: typeString as QuestionnaireInsuranceType,
      answers,
    };
  }

  // =============================================
  // Save draft
  // =============================================
  async saveDraft(sessionId: string, email?: string): Promise<SaveDraftResult> {
    const adminClient = createAdminClient();

    const updateData: Record<string, unknown> = {};
    // Email can be stored in answers or a separate field if needed

    if (email) {
      const { data: session } = await adminClient
        .from("questionnaire_sessions")
        .select("answers")
        .eq("id", sessionId)
        .single();

      if (session) {
        const answers = (session.answers as Record<string, unknown>) || {};
        answers._draft_email = email;
        updateData.answers = answers as Json;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await adminClient
        .from("questionnaire_sessions")
        .update(updateData)
        .eq("id", sessionId);
    }

    return { draftId: sessionId };
  }

  // =============================================
  // Delete draft
  // =============================================
  async deleteDraft(draftId: string, userId: string): Promise<void> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("questionnaire_sessions")
      .delete()
      .eq("id", draftId)
      .eq("user_id", userId)
      .eq("is_completed", false);

    if (error) {
      throw new Error(`Failed to delete draft: ${error.message}`);
    }
  }

  // =============================================
  // Abandon session
  // =============================================
  async abandonSession(sessionId: string): Promise<void> {
    const adminClient = createAdminClient();

    await adminClient
      .from("questionnaire_sessions")
      .delete()
      .eq("id", sessionId);
  }

  // =============================================
  // Get user drafts
  // =============================================
  async getUserDrafts(userId: string): Promise<GetUserDraftsResult> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("questionnaire_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_completed", false)
      .order("updated_at", { ascending: false });

    if (error) {
      logger.error("Error getting user drafts", error);
      return { drafts: [] };
    }

    const drafts: QuestionnaireSession[] = (data || []).map((row) =>
      this.toSession(row)
    );

    return { drafts };
  }

  // =============================================
  // Get session by ID
  // =============================================
  async getSession(sessionId: string): Promise<QuestionnaireSession | null> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("questionnaire_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.toSession(data);
  }

  // =============================================
  // Resume a session
  // =============================================
  async resume(sessionId: string, userId?: string): Promise<ResumeResult> {
    const adminClient = createAdminClient();

    const { data: session, error } = await adminClient
      .from("questionnaire_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      throw new Error("Session non trouvée");
    }

    const type = session.insurance_type as QuestionnaireInsuranceType;
    const questions = getQuestionsForType(type);
    const answers = (session.answers as Record<string, unknown>) || {};
    const currentIndex = session.current_question_index;

    // Find the current applicable question
    let questionIndex = currentIndex;
    while (
      questionIndex < questions.length &&
      !this.isQuestionApplicable(questions[questionIndex], answers)
    ) {
      questionIndex++;
    }

    if (questionIndex >= questions.length) {
      questionIndex = questions.length - 1;
    }

    const question = this.toQuestion(questions[questionIndex], answers);

    return {
      sessionId,
      type,
      question,
      progress: this.calculateProgress(questionIndex, questions, type),
    };
  }

  // =============================================
  // Helper methods
  // =============================================

  private isQuestionApplicable(
    config: QuestionConfig,
    answers: Record<string, unknown>
  ): boolean {
    if (!config.dependsOn) {
      return true;
    }

    const { questionId, equals, contains } = config.dependsOn;
    const dependentAnswer = answers[questionId];

    if (equals !== undefined) {
      return dependentAnswer === equals;
    }

    if (contains !== undefined && Array.isArray(dependentAnswer)) {
      return dependentAnswer.includes(contains);
    }

    return true;
  }

  private toQuestion(
    config: QuestionConfig,
    answers: Record<string, unknown>
  ): Question {
    return {
      id: config.id,
      type: config.type,
      label: config.label,
      tip: config.tip,
      required: config.required,
      options: config.options,
      followupQuestions: config.followupQuestions,
      unit: config.unit,
      placeholder: config.placeholder,
      min: config.min,
      max: config.max,
      currentValue: answers[config.id],
    };
  }

  private calculateProgress(
    currentIndex: number,
    questions: QuestionConfig[],
    type: string
  ): Progress {
    const total = questions.length;
    const current = Math.min(currentIndex + 1, total);
    const percent = Math.round((current / total) * 100);
    const stepLabel = questions[currentIndex]?.step || type;

    return { current, total, percent, stepLabel };
  }

  private canComplete(
    questions: QuestionConfig[],
    answers: Record<string, unknown>
  ): boolean {
    for (const q of questions) {
      if (!this.isQuestionApplicable(q, answers)) {
        continue;
      }
      if (q.required && answers[q.id] === undefined) {
        return false;
      }
    }
    return true;
  }

  private toSession(data: QuestionnaireSessionRow): QuestionnaireSession {
    const answers = (data.answers as Record<string, unknown>) || {};
    return {
      id: data.id,
      type: data.insurance_type as QuestionnaireInsuranceType,
      answers,
      currentQuestionIndex: data.current_question_index,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
      userId: data.user_id || undefined,
      email: (answers._draft_email as string) || undefined,
      status: data.is_completed ? "completed" : "in_progress",
    };
  }
}

export const supabaseQuestionnaireService = new SupabaseQuestionnaireService();
