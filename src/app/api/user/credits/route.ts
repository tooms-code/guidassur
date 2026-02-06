import { NextResponse } from "next/server";
import { createAuthHandler, RateLimit } from "@/backend/infrastructure/api/handler";
import { userService } from "@/backend/application/services/UserService";

export const GET = createAuthHandler(
  async (_request, { user }) => {
    const credits = await userService.getCredits(user.id);
    return NextResponse.json({ credits });
  },
  { rateLimit: RateLimit.GENERAL }
);
