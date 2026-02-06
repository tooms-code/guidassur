import { NextResponse } from "next/server";
import { createHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { questionnaireService } from "@/backend/application/services/QuestionnaireService";
import {
  AnswerQuestionRequestDto,
  NextQuestionResponseDto,
  toQuestionDto,
  toProgressDto,
} from "@/backend/application/dtos/questionnaire.dto";
import {
  verifySessionOwnership,
  NotFoundError,
  ForbiddenError,
} from "@/backend/application/guards/sessionOwnership";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

export const POST = createHandler(
  async (request, { user }) => {
    try {
      const body: AnswerQuestionRequestDto = await request.json();
      const { sessionId, questionId, answer } = body;

      if (!sessionId || !questionId) {
        const error: ErrorResponseDto = { error: "sessionId et questionId requis" };
        return NextResponse.json(error, { status: 400 });
      }

      await verifySessionOwnership(sessionId, user);

      const result = await questionnaireService.next(sessionId, questionId, answer);

      const response: NextQuestionResponseDto = {
        question: result.question ? toQuestionDto(result.question) : undefined,
        progress: result.progress ? toProgressDto(result.progress) : undefined,
        complete: result.complete,
        canComplete: result.canComplete,
      };

      return NextResponse.json(response);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error instanceof ForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      logger.error("Error processing next", error);
      if (error instanceof Error && error.message === "Session non trouvée") {
        const errorDto: ErrorResponseDto = { error: "Session non trouvée" };
        return NextResponse.json(errorDto, { status: 404 });
      }
      const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
      return NextResponse.json(errorDto, { status: 500 });
    }
  },
  { csrf: true, rateLimit: RateLimit.GENERAL }
);
