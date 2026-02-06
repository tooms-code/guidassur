import { NextRequest, NextResponse } from "next/server";
import { questionnaireService } from "@/backend/application/services/QuestionnaireService";
import { withOptionalAuth } from "@/backend/application/guards/AuthGuard";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { User } from "@/shared/types/user";
import { logger } from "@/backend/infrastructure/utils/logger";

async function handler(
  request: NextRequest,
  context: { user: User | null; params: { id: string } }
) {
  try {
    const sessionId = context.params.id;

    const session = await questionnaireService.getSession(sessionId);

    if (!session) {
      const error: ErrorResponseDto = { error: "Session introuvable" };
      return NextResponse.json(error, { status: 404 });
    }

    // Check if user owns this session (if session has userId)
    if (session.userId && context.user && session.userId !== context.user.id) {
      const error: ErrorResponseDto = { error: "Accès non autorisé" };
      return NextResponse.json(error, { status: 403 });
    }

    return NextResponse.json({
      session: {
        id: session.id,
        type: session.type,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        answersCount: Object.keys(session.answers).length,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    logger.error("Error getting session", error);
    const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
    return NextResponse.json(errorDto, { status: 500 });
  }
}

export const GET = withOptionalAuth<{ id: string }>(handler);
