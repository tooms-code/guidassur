import { NextRequest, NextResponse } from "next/server";
import { questionnaireService } from "@/backend/application/services/QuestionnaireService";
import { withAuth, AuthContext, RouteContext } from "@/backend/application/guards/AuthGuard";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

interface Params {
  id: string;
}

async function handler(request: NextRequest, context: AuthContext<Params>) {
  try {
    await questionnaireService.deleteDraft(context.params.id, context.user.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error("Error deleting draft", error, { draftId: context.params.id });
    const errorDto: ErrorResponseDto = { error: "Erreur lors de la suppression" };
    return NextResponse.json(errorDto, { status: 500 });
  }
}

export const DELETE = withAuth(handler);
