import { NextRequest, NextResponse } from "next/server";
import { createAuthHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { supabasePaymentService } from "@/backend/infrastructure/supabase/SupabasePaymentService";
import { PaymentListDto, mapPaymentToDto } from "@/backend/application/dtos/payment.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;

export const GET = createAuthHandler(
  async (request, { user }) => {
    try {
      const { searchParams } = new URL(request.url);

      const limitParam = searchParams.get("limit");
      const offsetParam = searchParams.get("offset");
      const status = searchParams.get("status");

      const limit = Math.min(
        limitParam ? parseInt(limitParam, 10) : DEFAULT_LIMIT,
        MAX_LIMIT
      );
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

      const { payments, total } = await supabasePaymentService.getByUserIdPaginated(
        user.id,
        { limit, offset, status: status || undefined }
      );

      const response: PaymentListDto = {
        data: payments.map(mapPaymentToDto),
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      };

      return NextResponse.json(response);
    } catch (error) {
      logger.error("Error fetching payments", error);
      return NextResponse.json(
        { error: "Erreur serveur" },
        { status: 500 }
      );
    }
  },
  { rateLimit: RateLimit.GENERAL }
);
