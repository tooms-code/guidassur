import { NextRequest, NextResponse } from "next/server";
import { questionnaireService } from "@/backend/application/services/QuestionnaireService";
import {
  SaveDraftRequestDto,
  SaveDraftResponseDto,
} from "@/backend/application/dtos/questionnaire.dto";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";

export async function POST(request: NextRequest) {
  try {
    const body: SaveDraftRequestDto = await request.json();
    const { sessionId, email } = body;

    if (!sessionId) {
      const error: ErrorResponseDto = { error: "sessionId requis" };
      return NextResponse.json(error, { status: 400 });
    }

    const result = await questionnaireService.saveDraft(sessionId, email);

    const response: SaveDraftResponseDto = {
      success: result.success,
      draftId: result.draftId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error saving draft:", error);
    if (error instanceof Error && error.message === "Session not found") {
      const errorDto: ErrorResponseDto = { error: "Session non trouvée" };
      return NextResponse.json(errorDto, { status: 404 });
    }
    const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
    return NextResponse.json(errorDto, { status: 500 });
  }
}
