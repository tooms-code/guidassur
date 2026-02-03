import { NextRequest, NextResponse } from "next/server";
import { questionnaireService } from "@/backend/application/services/QuestionnaireService";
import {
  AnswerQuestionRequestDto,
  NextQuestionResponseDto,
  toQuestionDto,
  toProgressDto,
} from "@/backend/application/dtos/questionnaire.dto";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";

export async function POST(request: NextRequest) {
  try {
    const body: AnswerQuestionRequestDto = await request.json();
    const { sessionId, questionId, answer } = body;

    if (!sessionId || !questionId) {
      const error: ErrorResponseDto = { error: "sessionId et questionId requis" };
      return NextResponse.json(error, { status: 400 });
    }

    const result = await questionnaireService.next(sessionId, questionId, answer);

    const response: NextQuestionResponseDto = {
      question: result.question ? toQuestionDto(result.question) : undefined,
      progress: result.progress ? toProgressDto(result.progress) : undefined,
      complete: result.complete,
      canComplete: result.canComplete,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error processing next:", error);
    if (error instanceof Error && error.message === "Session not found") {
      const errorDto: ErrorResponseDto = { error: "Session non trouvée" };
      return NextResponse.json(errorDto, { status: 404 });
    }
    const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
    return NextResponse.json(errorDto, { status: 500 });
  }
}
