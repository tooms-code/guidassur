import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthContext } from "@/backend/application/guards/AuthGuard";
import { analysisService } from "@/backend/application/services/AnalysisService";
import { InsuranceType } from "@/shared/types/insurance";
import { handleApiError, apiError } from "@/backend/infrastructure/api/errors";

interface SaveAnalysisRequest {
  sessionId: string;
  insuranceType: InsuranceType;
  answers: Record<string, unknown>;
}

async function handler(
  request: NextRequest,
  context: AuthContext<{ id: string }>
) {
  try {
    const { id } = context.params;

    // Check if analysis already exists in backend
    const existingAnalysis = await analysisService.getById(id);

    if (existingAnalysis) {
      // Check if already saved by another user
      if (existingAnalysis.userId && existingAnalysis.userId !== context.user.id) {
        return NextResponse.json(
          { error: "Cette analyse appartient à un autre utilisateur" },
          { status: 403 }
        );
      }

      // Check if already saved by this user
      if (existingAnalysis.userId === context.user.id) {
        return NextResponse.json({ alreadySaved: true });
      }

      // Get answers from request body (from sessionStorage)
      const body: SaveAnalysisRequest = await request.json().catch(() => ({}));

      // Link existing analysis to user and store answers
      await analysisService.saveToUser(id, context.user.id, body.answers);
      return NextResponse.json({ success: true });
    }

    // Analysis doesn't exist in backend (was created while not logged in)
    // Regenerate and persist it
    const body: SaveAnalysisRequest = await request.json();

    if (!body.sessionId || !body.insuranceType || !body.answers) {
      return NextResponse.json(
        { error: "Données de l'analyse requises" },
        { status: 400 }
      );
    }

    // Generate and persist the analysis with user's ID, keeping the same ID
    await analysisService.generate({
      sessionId: body.sessionId,
      insuranceType: body.insuranceType,
      answers: body.answers,
      userId: context.user.id,
      persist: true,
      existingId: id, // Keep the same ID so the user can access it at the same URL
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, `Error saving analysis ${context.params.id}`);
  }
}

export const POST = withAuth<{ id: string }>(handler);
