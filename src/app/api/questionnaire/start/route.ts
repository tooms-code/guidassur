import { NextResponse } from "next/server";
import { createHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { questionnaireService } from "@/backend/application/services/QuestionnaireService";
import {
  StartQuestionnaireRequestDto,
  StartQuestionnaireResponseDto,
  toQuestionDto,
  toProgressDto,
} from "@/backend/application/dtos/questionnaire.dto";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

export const POST = createHandler(
  async (request, { user }) => {
    try {
      const body: StartQuestionnaireRequestDto = await request.json();
      const { type, initialPrice } = body;

      if (!type || !["auto", "habitation", "gav", "mutuelle"].includes(type)) {
        const error: ErrorResponseDto = { error: "Type d'assurance invalide" };
        return NextResponse.json(error, { status: 400 });
      }

      // Pass userId if user is authenticated
      const result = await questionnaireService.start({
        type,
        userId: user?.id,
        initialPrice,
      });

      const response: StartQuestionnaireResponseDto = {
        sessionId: result.sessionId,
        question: toQuestionDto(result.question),
        progress: toProgressDto(result.progress),
      };

      return NextResponse.json(response);
    } catch (error) {
      logger.error("Error starting questionnaire", error);
      const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
      return NextResponse.json(errorDto, { status: 500 });
    }
  },
  { csrf: true, rateLimit: RateLimit.GENERAL }
);
