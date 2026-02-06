import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthContext } from "@/backend/application/guards/AuthGuard";
import { userService } from "@/backend/application/services/UserService";
import {
  UpdateSettingsRequestDto,
  mapUserSettingsToDto,
} from "@/backend/application/dtos/user.dto";
import { logger } from "@/backend/infrastructure/utils/logger";

async function getHandler(request: NextRequest, context: AuthContext) {
  try {
    const settings = await userService.getSettings(context.user.id);
    const response = mapUserSettingsToDto(settings);

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error fetching user settings", error, { userId: context.user.id });
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 }
    );
  }
}

async function putHandler(request: NextRequest, context: AuthContext) {
  try {
    const body: UpdateSettingsRequestDto = await request.json();

    const settings = await userService.updateProfile({
      userId: context.user.id,
      fullName: body.fullName,
      phone: body.phone,
      emailNotifications: body.emailNotifications,
    });

    const response = mapUserSettingsToDto(settings);

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error updating user settings", error, { userId: context.user.id });
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des paramètres" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
