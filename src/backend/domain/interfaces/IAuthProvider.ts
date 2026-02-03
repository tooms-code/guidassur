import { User } from "@/shared/types/user";

export type AuthProvider = "google" | "facebook";

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export type AuthResult =
  | { success: true; user: User; session: AuthSession }
  | { success: false; error: AuthError };

export type SimpleResult =
  | { success: true }
  | { success: false; error: string };

export interface MFAEnrollResult {
  success: boolean;
  factorId?: string;
  qrCode?: string;  // Data URL or TOTP URI
  secret?: string;
  error?: string;
}

export type RefreshResult =
  | { success: true; session: AuthSession; user: User }
  | { success: false; error: string };

export interface IAuthProvider {
  // Authentication
  signInWithEmail(email: string, password: string): Promise<AuthResult>;
  signInWithProvider(provider: AuthProvider): Promise<AuthResult>;
  signUp(email: string, password: string, fullName?: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  refreshSession(refreshToken: string): Promise<RefreshResult>;

  // Password management
  changePassword(currentPassword: string, newPassword: string): Promise<SimpleResult>;
  resetPassword(email: string): Promise<SimpleResult>;

  // MFA - Compatible with Supabase Auth MFA
  getMFAStatus(): Promise<{ enabled: boolean; factorId?: string }>;
  enrollMFA(): Promise<MFAEnrollResult>;
  verifyMFA(factorId: string, code: string): Promise<SimpleResult>;
  unenrollMFA(factorId: string, code: string): Promise<SimpleResult>;
}
