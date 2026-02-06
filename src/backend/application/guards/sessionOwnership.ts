import { QuestionnaireSession } from "@/backend/domain/entities/QuestionnaireSession";
import { questionnaireService } from "@/backend/application/services/QuestionnaireService";
import { User } from "@/shared/types/user";

export class NotFoundError extends Error {
  constructor(message = "Session non trouvée") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Non autorisé") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Verifies that a questionnaire session exists and that the given user
 * is allowed to access it.
 *
 * - If the session has a userId, the current user must match.
 * - If the session has no userId (anonymous), access is allowed.
 *
 * @throws NotFoundError if session does not exist
 * @throws ForbiddenError if user does not own the session
 */
export async function verifySessionOwnership(
  sessionId: string,
  user: User | null
): Promise<QuestionnaireSession> {
  const session = await questionnaireService.getSession(sessionId);

  if (!session) {
    throw new NotFoundError();
  }

  if (session.userId && (!user || user.id !== session.userId)) {
    throw new ForbiddenError();
  }

  return session;
}
