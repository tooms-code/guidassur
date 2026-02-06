import { NextResponse } from "next/server";
import { createHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { questionnaireService } from "@/backend/application/services/QuestionnaireService";
import {
  verifySessionOwnership,
  NotFoundError,
  ForbiddenError,
} from "@/backend/application/guards/sessionOwnership";
import {
  ResumeQuestionnaireRequestDto,
  ResumeQuestionnaireResponseDto,
  toQuestionDto,
  toProgressDto,
} from "@/backend/application/dtos/questionnaire.dto";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

export const POST = createHandler(
  async (request, { user }) => {
    try {
      const body: ResumeQuestionnaireRequestDto = await request.json();
      const { sessionId } = body;

      if (!sessionId) {
        const error: ErrorResponseDto = { error: "Session ID requis" };
        return NextResponse.json(error, { status: 400 });
      }

      // Verify ownership - if session has a userId, current user must match
      await verifySessionOwnership(sessionId, user);

      // Resume without auto-linking (userId is not passed to prevent session stealing)
      const result = await questionnaireService.resume(sessionId);

      const response: ResumeQuestionnaireResponseDto = {
        sessionId: result.sessionId,
        type: result.type,
        question: toQuestionDto(result.question),
        progress: toProgressDto(result.progress),
      };

      return NextResponse.json(response);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
      }
      if (error instanceof ForbiddenError) {
        return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
      }
      logger.error("Error resuming questionnaire", error);

      if (error instanceof Error) {
        if (error.message === "Session non trouvée") {
          const errorDto: ErrorResponseDto = { error: "Session introuvable" };
          return NextResponse.json(errorDto, { status: 404 });
        }
      }

      const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
      return NextResponse.json(errorDto, { status: 500 });
    }
  },
  { csrf: true, rateLimit: RateLimit.GENERAL }
);
