import { User } from "@/shared/types/user";

export type AuthProvider = "google" | "facebook";

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthResult {
  user: User;
  session: AuthSession;
}

export interface MFAEnrollResult {
  factorId: string;
  qrCode: string;
  secret: string;
}

export interface RefreshResult {
  session: AuthSession;
  user: User;
}

export interface IAuthProvider {
  // Authentication - throws AuthError on failure
  signInWithEmail(email: string, password: string): Promise<AuthResult>;
  signInWithProvider(provider: AuthProvider): Promise<AuthResult>;
  signUp(email: string, password: string, fullName?: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  refreshSession(refreshToken: string): Promise<RefreshResult>;

  // Password management - throws AuthError on failure
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  resetPassword(email: string): Promise<void>;
  verifyPassword(password: string): Promise<boolean>;

  // MFA - throws AuthError on failure
  getMFAStatus(): Promise<{ enabled: boolean; factorId?: string; pendingFactorId?: string }>;
  enrollMFA(): Promise<MFAEnrollResult>;
  verifyMFA(factorId: string, code: string): Promise<void>;
  unenrollMFA(factorId: string, code: string): Promise<void>;
  getAALStatus(): Promise<{ currentLevel: string; nextLevel: string }>;
  challengeMFA(factorId: string, code: string): Promise<void>;
}
