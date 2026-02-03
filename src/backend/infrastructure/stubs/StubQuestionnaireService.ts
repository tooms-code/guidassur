import {
  IQuestionnaireService,
  StartResult,
  NextResult,
  PrevResult,
  CompleteResult,
  SaveDraftResult,
} from "@/backend/domain/interfaces/IQuestionnaireService";
import { QuestionnaireSession } from "@/backend/domain/entities/QuestionnaireSession";
import {
  InsuranceType,
  Question,
  Progress,
  QuestionConfig,
} from "@/shared/types/questionnaire";
import { InsuranceType as InsuranceTypeEnum } from "@/shared/types/insurance";
import { getQuestionsForType } from "@/backend/infrastructure/config/questions";
import { analysisService } from "@/backend/application/services/AnalysisService";

class StubQuestionnaireService implements IQuestionnaireService {
  private sessions: Map<string, QuestionnaireSession> = new Map();

  private generateId(): string {
    return "sess_" + Math.random().toString(36).substr(2, 12);
  }

  private getApplicableQuestions(
    type: InsuranceType,
    answers: Record<string, unknown>
  ): QuestionConfig[] {
    const allQuestions = getQuestionsForType(type);

    return allQuestions.filter((q) => {
      if (!q.dependsOn) return true;

      const { questionId, equals, contains } = q.dependsOn;
      const dependentAnswer = answers[questionId];

      if (equals !== undefined) {
        return dependentAnswer === equals;
      }

      if (contains !== undefined && Array.isArray(dependentAnswer)) {
        return dependentAnswer.includes(contains);
      }

      return true;
    });
  }

  private configToQuestion(
    config: QuestionConfig,
    currentValue?: unknown
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
      currentValue,
    };
  }

  private calculateProgress(
    currentIndex: number,
    questions: QuestionConfig[]
  ): Progress {
    const total = questions.length;
    const current = Math.min(currentIndex + 1, total);
    const percent = Math.round((current / total) * 100);

    const currentQuestion = questions[currentIndex];
    const stepLabel = currentQuestion?.step || "Question";

    return { current, total, percent, stepLabel };
  }

  async start(type: InsuranceType): Promise<StartResult> {
    const sessionId = this.generateId();
    const session: QuestionnaireSession = {
      id: sessionId,
      type,
      answers: {},
      currentQuestionIndex: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.sessions.set(sessionId, session);

    const questions = this.getApplicableQuestions(type, {});
    const firstQuestion = questions[0];

    return {
      sessionId,
      question: this.configToQuestion(firstQuestion),
      progress: this.calculateProgress(0, questions),
    };
  }

  async next(
    sessionId: string,
    questionId: string,
    answer: unknown
  ): Promise<NextResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Save answer
    session.answers[questionId] = answer;
    session.updatedAt = Date.now();

    // Get applicable questions with new answers
    const questions = this.getApplicableQuestions(session.type, session.answers);

    // Find current question index
    const currentIndex = questions.findIndex((q) => q.id === questionId);
    const nextIndex = currentIndex + 1;

    // Check if complete
    if (nextIndex >= questions.length) {
      session.currentQuestionIndex = questions.length - 1;
      return {
        complete: true,
        canComplete: true,
      };
    }

    // Move to next question
    session.currentQuestionIndex = nextIndex;
    const nextQuestion = questions[nextIndex];

    return {
      question: this.configToQuestion(nextQuestion),
      progress: this.calculateProgress(nextIndex, questions),
    };
  }

  async prev(sessionId: string): Promise<PrevResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const questions = this.getApplicableQuestions(session.type, session.answers);

    // Go back
    const prevIndex = Math.max(0, session.currentQuestionIndex - 1);
    session.currentQuestionIndex = prevIndex;
    session.updatedAt = Date.now();

    const prevQuestion = questions[prevIndex];
    const currentValue = session.answers[prevQuestion.id];

    return {
      question: this.configToQuestion(prevQuestion, currentValue),
      progress: this.calculateProgress(prevIndex, questions),
    };
  }

  async complete(sessionId: string): Promise<CompleteResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Map string type to InsuranceType enum
    const typeMap: Record<InsuranceType, InsuranceTypeEnum> = {
      auto: InsuranceTypeEnum.AUTO,
      habitation: InsuranceTypeEnum.HABITATION,
      gav: InsuranceTypeEnum.GAV,
      mutuelle: InsuranceTypeEnum.MUTUELLE,
    };

    // Generate analysis using the analysis service
    const insuranceType = typeMap[session.type];
    const analysis = await analysisService.generate({
      sessionId,
      insuranceType,
      answers: session.answers,
    });

    return {
      analysisId: analysis.id,
      analysis,
      insuranceType,
      answers: session.answers,
    };
  }

  async saveDraft(sessionId: string, email?: string): Promise<SaveDraftResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Generate draft ID
    const draftId = "draft_" + Math.random().toString(36).substr(2, 12);

    // In a real app, we would save to database with email
    console.log("Draft saved:", { draftId, sessionId, email });

    return { success: true, draftId };
  }
}

export const questionnaireService = new StubQuestionnaireService();
