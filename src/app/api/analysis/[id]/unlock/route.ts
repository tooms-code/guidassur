import { NextRequest, NextResponse } from "next/server";
import { analysisService } from "@/backend/application/services/AnalysisService";
import { mapAnalysisToFullDto } from "@/backend/application/dtos/analysis.dto";
import { InsuranceType } from "@/shared/types/insurance";

interface UnlockRequest {
  sessionId: string;
  insuranceType: InsuranceType;
  answers: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add Stripe payment verification here later
    // For now, simulate successful payment

    const body: UnlockRequest = await request.json();

    if (!body.sessionId || !body.insuranceType || !body.answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Regenerate the analysis with full insights
    const analysis = await analysisService.generate({
      sessionId: body.sessionId,
      insuranceType: body.insuranceType,
      answers: body.answers,
    });

    // Return full analysis with all insights unlocked
    const response = mapAnalysisToFullDto(analysis);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error unlocking analysis:", error);
    return NextResponse.json(
      { error: "Failed to unlock analysis" },
      { status: 500 }
    );
  }
}
