import {
  IQuestionnaireService,
  StartResult,
  NextResult,
  PrevResult,
  CompleteResult,
  SaveDraftResult,
} from "@/backend/domain/interfaces/IQuestionnaireService";
import { InsuranceType } from "@/shared/types/questionnaire";

// Import the stub provider - will be swapped for real implementation later
import { questionnaireService as questionnaireProvider } from "@/backend/infrastructure/stubs/StubQuestionnaireService";

class QuestionnaireService implements IQuestionnaireService {
  private provider: IQuestionnaireService;

  constructor(provider: IQuestionnaireService) {
    this.provider = provider;
  }

  async start(type: InsuranceType): Promise<StartResult> {
    return this.provider.start(type);
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
}

export const questionnaireService = new QuestionnaireService(questionnaireProvider);
