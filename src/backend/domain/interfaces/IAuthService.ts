import { User } from "@/shared/types/user";
import { AuthError } from "@/backend/domain/errors/auth.errors";

export type OAuthProvider = "google" | "facebook";

// Re-export for convenience
export { AuthError };

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthResult {
  user: User;
  session: Session;
}

export interface RefreshResult {
  session: Session;
}

export interface IAuthService {
  signInWithEmail(email: string, password: string): Promise<AuthResult>;
  signInWithProvider(provider: OAuthProvider): Promise<{ url: string }>;
  signUp(email: string, password: string, fullName?: string): Promise<AuthResult>;
  signOut(accessToken: string): Promise<void>;
  refreshSession(refreshToken: string): Promise<RefreshResult>;
  getCurrentUser(accessToken: string): Promise<User | null>;
  verifyPassword(email: string, password: string): Promise<boolean>;
}
