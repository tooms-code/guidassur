import { NextRequest, NextResponse } from "next/server";
import { analysisService } from "@/backend/application/services/AnalysisService";
import {
  GenerateAnalysisRequestDto,
  mapAnalysisToFreeDto,
} from "@/backend/application/dtos/analysis.dto";
import { InsuranceType } from "@/shared/types/insurance";

export async function POST(request: NextRequest) {
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
    const analysis = await analysisService.generate({
      sessionId: body.sessionId,
      insuranceType: body.insuranceType,
      answers: body.answers,
    });

    // Return free tier response by default
    const response = mapAnalysisToFreeDto(analysis);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error generating analysis:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
