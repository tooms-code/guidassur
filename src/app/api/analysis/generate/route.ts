import { NextResponse } from "next/server";
import { createHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { analysisService } from "@/backend/application/services/AnalysisService";
import {
  GenerateAnalysisRequestDto,
  mapAnalysisToPublicDto,
} from "@/backend/application/dtos/analysis.dto";
import { InsuranceType } from "@/shared/types/insurance";
import { logger } from "@/backend/infrastructure/utils/logger";

export const POST = createHandler(
  async (request, { user }) => {
    try {
      const body: GenerateAnalysisRequestDto = await request.json();

      // Validate request
      if (!body.sessionId || !body.insuranceType || !body.answers) {
        return NextResponse.json(
          { error: "Missing required fields: sessionId, insuranceType, answers" },
          { status: 400 }
        );
      }

      // Validate insurance type
      const validTypes = Object.values(InsuranceType);
      if (!validTypes.includes(body.insuranceType)) {
        return NextResponse.json(
          { error: `Invalid insuranceType. Must be one of: ${validTypes.join(", ")}` },
          { status: 400 }
        );
      }

      // Generate analysis
      // Only persist if user is logged in - anonymous analyses live in sessionStorage only
      const analysis = await analysisService.generate({
        sessionId: body.sessionId,
        insuranceType: body.insuranceType,
        answers: body.answers,
        userId: user?.id,
        persist: !!user,
      });

      // Return response (filtered based on isUnlocked status)
      const response = mapAnalysisToPublicDto(analysis);

      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      logger.error("Error generating analysis", error);
      return NextResponse.json(
        { error: "Failed to generate analysis" },
        { status: 500 }
      );
    }
  },
  { csrf: true, rateLimit: RateLimit.GENERAL }
);
