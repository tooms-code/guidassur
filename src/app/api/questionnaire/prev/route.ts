import { NextRequest, NextResponse } from "next/server";
import { questionnaireService } from "@/backend/application/services/QuestionnaireService";
import {
  PrevQuestionRequestDto,
  PrevQuestionResponseDto,
  toQuestionDto,
  toProgressDto,
} from "@/backend/application/dtos/questionnaire.dto";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";

export async function POST(request: NextRequest) {
  try {
    const body: PrevQuestionRequestDto = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      const error: ErrorResponseDto = { error: "sessionId requis" };
      return NextResponse.json(error, { status: 400 });
    }

    const result = await questionnaireService.prev(sessionId);

    const response: PrevQuestionResponseDto = {
      question: toQuestionDto(result.question),
      progress: toProgressDto(result.progress),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error processing prev:", error);
    if (error instanceof Error && error.message === "Session not found") {
      const errorDto: ErrorResponseDto = { error: "Session non trouvée" };
      return NextResponse.json(errorDto, { status: 404 });
    }
    const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
    return NextResponse.json(errorDto, { status: 500 });
  }
}
