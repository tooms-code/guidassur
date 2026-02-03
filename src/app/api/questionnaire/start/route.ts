import { NextRequest, NextResponse } from "next/server";
import { questionnaireService } from "@/backend/application/services/QuestionnaireService";
import {
  StartQuestionnaireRequestDto,
  StartQuestionnaireResponseDto,
  toQuestionDto,
  toProgressDto,
} from "@/backend/application/dtos/questionnaire.dto";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";

export async function POST(request: NextRequest) {
  try {
    const body: StartQuestionnaireRequestDto = await request.json();
    const { type } = body;

    if (!type || !["auto", "habitation", "gav", "mutuelle"].includes(type)) {
      const error: ErrorResponseDto = { error: "Type d'assurance invalide" };
      return NextResponse.json(error, { status: 400 });
    }

    const result = await questionnaireService.start(type);

    const response: StartQuestionnaireResponseDto = {
      sessionId: result.sessionId,
      question: toQuestionDto(result.question),
      progress: toProgressDto(result.progress),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error starting questionnaire:", error);
    const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
    return NextResponse.json(errorDto, { status: 500 });
  }
}
