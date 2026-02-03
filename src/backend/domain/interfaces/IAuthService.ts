import { User } from "@/shared/types/user";

export type OAuthProvider = "google" | "facebook";

export interface AuthError {
  code: string;
  message: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthResultSuccess {
  success: true;
  user: User;
  session: Session;
}

export interface AuthResultError {
  success: false;
  error: AuthError;
}

export type AuthResult = AuthResultSuccess | AuthResultError;

export type RefreshResult =
  | { success: true; session: Session }
  | { success: false; error: AuthError };

export interface IAuthService {
  signInWithEmail(email: string, password: string): Promise<AuthResult>;
  signInWithProvider(provider: OAuthProvider): Promise<{ url: string } | AuthResultError>;
  signUp(email: string, password: string, fullName?: string): Promise<AuthResult>;
  signOut(accessToken: string): Promise<void>;
  refreshSession(refreshToken: string): Promise<RefreshResult>;
  getCurrentUser(accessToken: string): Promise<User | null>;
}
