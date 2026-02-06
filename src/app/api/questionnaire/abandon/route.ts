import { NextResponse } from "next/server";
import { createHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { questionnaireService } from "@/backend/application/services/QuestionnaireService";
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
      const body = await request.json();
      const { sessionId } = body;

      if (!sessionId) {
        const error: ErrorResponseDto = { error: "Session ID requis" };
        return NextResponse.json(error, { status: 400 });
      }

      await verifySessionOwnership(sessionId, user);
      await questionnaireService.abandonSession(sessionId);

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error instanceof ForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      logger.error("Error abandoning session", error);
      const errorDto: ErrorResponseDto = { error: "Erreur lors de l'abandon de la session" };
      return NextResponse.json(errorDto, { status: 500 });
    }
  },
  { csrf: true, rateLimit: RateLimit.GENERAL }
);
