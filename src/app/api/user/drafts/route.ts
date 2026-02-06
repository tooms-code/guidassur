import { NextRequest, NextResponse } from "next/server";
import { questionnaireService } from "@/backend/application/services/QuestionnaireService";
import { withAuth, AuthenticatedHandler } from "@/backend/application/guards/AuthGuard";
import { ErrorResponseDto } from "@/backend/application/dtos/auth.dto";
import { InsuranceType } from "@/shared/types/questionnaire";
import { logger } from "@/backend/infrastructure/utils/logger";

export interface DraftDto {
  id: string;
  type: InsuranceType;
  answersCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface GetUserDraftsResponseDto {
  drafts: DraftDto[];
}

const handler: AuthenticatedHandler = async (request, context) => {
  try {
    const result = await questionnaireService.getUserDrafts(context.user.id);

    const response: GetUserDraftsResponseDto = {
      drafts: result.drafts.map((draft) => ({
        id: draft.id,
        type: draft.type,
        answersCount: Object.keys(draft.answers).length,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error getting user drafts", error, { userId: context.user.id });
    const errorDto: ErrorResponseDto = { error: "Erreur interne du serveur" };
    return NextResponse.json(errorDto, { status: 500 });
  }
};

export const GET = withAuth(handler);
