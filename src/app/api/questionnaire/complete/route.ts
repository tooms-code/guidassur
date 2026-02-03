import { NextRequest, NextResponse } from "next/server";
import { questionnaireService } from "@/backend/application/services/QuestionnaireService";
import {
  CompleteQuestionnaireRequestDto,
  CompleteQuestionnaireResponseDto,
} from "@/backend/application/dtos/questionnaire.dto";
import { mapAnalysisToFreeDto } from "@/backend/application/dtos/analysis.dto";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";

export async function POST(request: NextRequest) {
  try {
    const body: CompleteQuestionnaireRequestDto = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      const error: ErrorResponseDto = { error: "sessionId requis" };
      return NextResponse.json(error, { status: 400 });
    }

    const result = await questionnaireService.complete(sessionId);
    const freeAnalysis = mapAnalysisToFreeDto(result.analysis);

    const response: CompleteQuestionnaireResponseDto = {
      analysisId: result.analysisId,
      insuranceType: result.insuranceType,
      answers: result.answers,
      analysis: freeAnalysis,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error completing questionnaire:", error);
    if (error instanceof Error && error.message === "Session not found") {
      const errorDto: ErrorResponseDto = { error: "Session non trouvée" };
      return NextResponse.json(errorDto, { status: 404 });
    }
    const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
    return NextResponse.json(errorDto, { status: 500 });
  }
}
