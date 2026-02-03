import { NextRequest, NextResponse } from "next/server";
import { analysisService } from "@/backend/application/services/AnalysisService";
import { mapAnalysisToFreeDto } from "@/backend/application/dtos/analysis.dto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const analysis = await analysisService.getById(id);

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    const response = mapAnalysisToFreeDto(analysis);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}
