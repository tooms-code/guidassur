import {
  IAuthProvider,
  AuthProvider,
  AuthResult,
  AuthSession,
  SimpleResult,
  MFAEnrollResult,
  RefreshResult,
} from "@/backend/domain/interfaces/IAuthProvider";
import { User } from "@/shared/types/user";

const STORAGE_KEY = "guidassur_auth_user";
const MFA_STORAGE_KEY = "guidassur_mfa";

interface MFAData {
  factorId: string;
  secret: string;
  enabled: boolean;
}

export class StubAuthProvider implements IAuthProvider {
  private currentUser: User | null = null;
  private mfaData: MFAData | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
      const mfaStored = localStorage.getItem(MFA_STORAGE_KEY);
      if (mfaStored) {
        this.mfaData = JSON.parse(mfaStored);
      }
    }
  }

  private setMFAData(data: MFAData | null): void {
    this.mfaData = data;
    if (typeof window !== "undefined") {
      if (data) {
        localStorage.setItem(MFA_STORAGE_KEY, JSON.stringify(data));
      } else {
        localStorage.removeItem(MFA_STORAGE_KEY);
      }
    }
  }

  private setUser(user: User | null): void {
    this.currentUser = user;
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  private createMockUser(email: string, fullName?: string): User {
    return {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      email,
      fullName: fullName || email.split("@")[0],
      credits: 0,
      createdAt: Date.now(),
    };
  }

  private createMockSession(): AuthSession {
    return {
      accessToken: "mock_access_" + Math.random().toString(36).substr(2, 16),
      refreshToken: "mock_refresh_" + Math.random().toString(36).substr(2, 16),
      expiresAt: Date.now() + 3600 * 1000, // 1 hour
    };
  }

  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!email.includes("@")) {
      return {
        success: false,
        error: { code: "invalid_email", message: "Email invalide" },
      };
    }

    if (password.length < 4) {
      return {
        success: false,
        error: {
          code: "invalid_password",
          message: "Mot de passe trop court",
        },
      };
    }

    const user = this.createMockUser(email);
    this.setUser(user);

    return { success: true, user, session: this.createMockSession() };
  }

  async signInWithProvider(provider: AuthProvider): Promise<AuthResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const email =
      provider === "google" ? "jean@gmail.com" : "jean@facebook.com";
    const user = this.createMockUser(email, "Jean Dupont");
    this.setUser(user);

    return { success: true, user, session: this.createMockSession() };
  }

  private validatePassword(password: string): string | null {
    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!/[a-z]/.test(password)) {
      return "Le mot de passe doit contenir une minuscule";
    }
    if (!/[A-Z]/.test(password)) {
      return "Le mot de passe doit contenir une majuscule";
    }
    if (!/\d/.test(password)) {
      return "Le mot de passe doit contenir un chiffre";
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(password)) {
      return "Le mot de passe doit contenir un caractère spécial";
    }
    return null;
  }

  async signUp(
    email: string,
    password: string,
    fullName?: string
  ): Promise<AuthResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!email.includes("@")) {
      return {
        success: false,
        error: { code: "invalid_email", message: "Email invalide" },
      };
    }

    const passwordError = this.validatePassword(password);
    if (passwordError) {
      return {
        success: false,
        error: {
          code: "weak_password",
          message: passwordError,
        },
      };
    }

    const user = this.createMockUser(email, fullName);
    this.setUser(user);

    return { success: true, user, session: this.createMockSession() };
  }

  async signOut(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    this.setUser(null);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async refreshSession(refreshToken: string): Promise<RefreshResult> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    // For stub: if user exists and token looks valid, return new session
    if (!this.currentUser || !refreshToken.startsWith("mock_refresh_")) {
      return { success: false, error: "Session invalide" };
    }

    return {
      success: true,
      session: this.createMockSession(),
      user: this.currentUser,
    };
  }

  // Password management
  async changePassword(currentPassword: string, newPassword: string): Promise<SimpleResult> {
    await new Promise((r) => setTimeout(r, 500));

    if (!this.currentUser) {
      return { success: false, error: "Non connecté" };
    }

    if (currentPassword.length < 4) {
      return { success: false, error: "Mot de passe actuel incorrect" };
    }

    const passwordError = this.validatePassword(newPassword);
    if (passwordError) {
      return { success: false, error: passwordError };
    }

    return { success: true };
  }

  async resetPassword(email: string): Promise<SimpleResult> {
    await new Promise((r) => setTimeout(r, 500));

    if (!email.includes("@")) {
      return { success: false, error: "Email invalide" };
    }

    // In real implementation, sends reset email
    console.log("[Stub] Password reset email sent to:", email);
    return { success: true };
  }

  // MFA - Mimics Supabase Auth MFA API
  async getMFAStatus(): Promise<{ enabled: boolean; factorId?: string }> {
    await new Promise((r) => setTimeout(r, 200));

    if (this.mfaData?.enabled) {
      return { enabled: true, factorId: this.mfaData.factorId };
    }
    if (this.mfaData?.factorId) {
      // Enrolled but not verified yet
      return { enabled: false, factorId: this.mfaData.factorId };
    }
    return { enabled: false };
  }

  async enrollMFA(): Promise<MFAEnrollResult> {
    await new Promise((r) => setTimeout(r, 300));

    if (!this.currentUser) {
      return { success: false, error: "Non connecté" };
    }

    // Generate mock factor
    const factorId = "factor_" + Math.random().toString(36).substr(2, 9);
    const secret = "MOCK" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const qrCode = `otpauth://totp/Guidassur:${this.currentUser.email}?secret=${secret}&issuer=Guidassur`;

    // Store but not enabled yet (needs verification)
    this.setMFAData({ factorId, secret, enabled: false });

    return {
      success: true,
      factorId,
      secret,
      qrCode,
    };
  }

  async verifyMFA(factorId: string, code: string): Promise<SimpleResult> {
    await new Promise((r) => setTimeout(r, 300));

    if (!this.mfaData || this.mfaData.factorId !== factorId) {
      return { success: false, error: "Facteur MFA non trouvé" };
    }

    // Accept any 6-digit code for mock
    if (!/^\d{6}$/.test(code)) {
      return { success: false, error: "Code invalide (6 chiffres requis)" };
    }

    // Enable MFA
    this.setMFAData({ ...this.mfaData, enabled: true });
    return { success: true };
  }

  async unenrollMFA(factorId: string, code: string): Promise<SimpleResult> {
    await new Promise((r) => setTimeout(r, 300));

    if (!this.mfaData || this.mfaData.factorId !== factorId) {
      return { success: false, error: "Facteur MFA non trouvé" };
    }

    if (!/^\d{6}$/.test(code)) {
      return { success: false, error: "Code invalide (6 chiffres requis)" };
    }

    // Disable and remove MFA
    this.setMFAData(null);
    return { success: true };
  }
}

export const authProvider = new StubAuthProvider();
