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
import { getQuestionnaireServiceProvider } from "@/backend/infrastructure/providers";

class QuestionnaireService implements IQuestionnaireService {
  private provider = getQuestionnaireServiceProvider();

  async start(params: StartParams): Promise<StartResult> {
    return this.provider.start(params);
  }

  async next(
    sessionId: string,
    questionId: string,
    answer: unknown
  ): Promise<NextResult> {
    return this.provider.next(sessionId, questionId, answer);
  }

  async prev(sessionId: string): Promise<PrevResult> {
    return this.provider.prev(sessionId);
  }

  async complete(sessionId: string): Promise<CompleteResult> {
    return this.provider.complete(sessionId);
  }

  async saveDraft(sessionId: string, email?: string): Promise<SaveDraftResult> {
    return this.provider.saveDraft(sessionId, email);
  }

  async deleteDraft(draftId: string, userId: string): Promise<void> {
    return this.provider.deleteDraft(draftId, userId);
  }

  async abandonSession(sessionId: string): Promise<void> {
    return this.provider.abandonSession(sessionId);
  }

  async getUserDrafts(userId: string): Promise<GetUserDraftsResult> {
    return this.provider.getUserDrafts(userId);
  }

  async getSession(sessionId: string): Promise<QuestionnaireSession | null> {
    return this.provider.getSession(sessionId);
  }

  async resume(sessionId: string, userId?: string): Promise<ResumeResult> {
    return this.provider.resume(sessionId, userId);
  }
}

export const questionnaireService = new QuestionnaireService();
