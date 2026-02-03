import {
  IAuthProvider,
  AuthProvider,
  AuthResult,
  SimpleResult,
  MFAEnrollResult,
  RefreshResult,
} from "@/backend/domain/interfaces/IAuthProvider";
import { User } from "@/shared/types/user";
import { authProvider } from "@/backend/infrastructure/stubs/StubAuthProvider";

class AuthService implements IAuthProvider {
  private provider: IAuthProvider;

  constructor(provider: IAuthProvider) {
    this.provider = provider;
  }

  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    return this.provider.signInWithEmail(email, password);
  }

  async signInWithProvider(provider: AuthProvider): Promise<AuthResult> {
    return this.provider.signInWithProvider(provider);
  }

  async signUp(email: string, password: string, fullName?: string): Promise<AuthResult> {
    return this.provider.signUp(email, password, fullName);
  }

  async signOut(): Promise<void> {
    return this.provider.signOut();
  }

  getCurrentUser(): User | null {
    return this.provider.getCurrentUser();
  }

  async refreshSession(refreshToken: string): Promise<RefreshResult> {
    return this.provider.refreshSession(refreshToken);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<SimpleResult> {
    return this.provider.changePassword(currentPassword, newPassword);
  }

  async resetPassword(email: string): Promise<SimpleResult> {
    return this.provider.resetPassword(email);
  }

  async getMFAStatus(): Promise<{ enabled: boolean; factorId?: string }> {
    return this.provider.getMFAStatus();
  }

  async enrollMFA(): Promise<MFAEnrollResult> {
    return this.provider.enrollMFA();
  }

  async verifyMFA(factorId: string, code: string): Promise<SimpleResult> {
    return this.provider.verifyMFA(factorId, code);
  }

  async unenrollMFA(factorId: string, code: string): Promise<SimpleResult> {
    return this.provider.unenrollMFA(factorId, code);
  }
}

export const authService = new AuthService(authProvider);
