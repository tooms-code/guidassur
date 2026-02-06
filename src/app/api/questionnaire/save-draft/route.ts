import { NextResponse } from "next/server";
import { createHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { questionnaireService } from "@/backend/application/services/QuestionnaireService";
import {
  SaveDraftRequestDto,
  SaveDraftResponseDto,
} from "@/backend/application/dtos/questionnaire.dto";
import {
  verifySessionOwnership,
  NotFoundError,
  ForbiddenError,
} from "@/backend/application/guards/sessionOwnership";
import { isValidEmail } from "@/backend/infrastructure/api/inputValidation";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

export const POST = createHandler(
  async (request, { user }) => {
    try {
      const body: SaveDraftRequestDto = await request.json();
      const { sessionId, email } = body;

      if (!sessionId) {
        const error: ErrorResponseDto = { error: "sessionId requis" };
        return NextResponse.json(error, { status: 400 });
      }

      // Validate email if provided
      if (email && !isValidEmail(email)) {
        const error: ErrorResponseDto = { error: "Email invalide" };
        return NextResponse.json(error, { status: 400 });
      }

      await verifySessionOwnership(sessionId, user);

      const result = await questionnaireService.saveDraft(sessionId, email);

      const response: SaveDraftResponseDto = {
        draftId: result.draftId,
      };

      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error instanceof ForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      logger.error("Error saving draft", error);
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
