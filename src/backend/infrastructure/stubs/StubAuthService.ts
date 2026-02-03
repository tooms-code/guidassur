import {
  IAuthService,
  OAuthProvider,
  AuthResult,
  AuthResultError,
  RefreshResult,
  Session,
} from "@/backend/domain/interfaces/IAuthService";
import { User } from "@/shared/types/user";

// In-memory storage for stub
const users: Map<string, { user: User; password: string }> = new Map();
const sessions: Map<string, { user: User; expiresAt: number }> = new Map();

class StubAuthService implements IAuthService {
  private generateToken(): string {
    return "tok_" + Math.random().toString(36).substr(2, 24);
  }

  private createSession(user: User): Session {
    const accessToken = this.generateToken();
    const refreshToken = this.generateToken();
    const expiresAt = Date.now() + 3600 * 1000; // 1 hour

    sessions.set(accessToken, { user, expiresAt });

    return { accessToken, refreshToken, expiresAt };
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

  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const stored = users.get(email);

    if (!stored || stored.password !== password) {
      return {
        success: false,
        error: { code: "invalid_credentials", message: "Email ou mot de passe incorrect" },
      };
    }

    const session = this.createSession(stored.user);

    return { success: true, user: stored.user, session };
  }

  async signInWithProvider(
    provider: OAuthProvider
  ): Promise<{ url: string } | AuthResultError> {
    // In real implementation, this returns the OAuth URL
    // For stub, we'll simulate by returning a callback URL
    return {
      url: `/api/auth/callback/${provider}?code=stub_code`,
    };
  }

  async signUp(
    email: string,
    password: string,
    fullName?: string
  ): Promise<AuthResult> {
    await new Promise((resolve) => setTimeout(resolve, 300));

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
        error: { code: "weak_password", message: passwordError },
      };
    }

    if (users.has(email)) {
      return {
        success: false,
        error: { code: "email_exists", message: "Cet email est déjà utilisé" },
      };
    }

    const user: User = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      email,
      fullName: fullName || email.split("@")[0],
      credits: 0,
      createdAt: Date.now(),
    };

    users.set(email, { user, password });

    const session = this.createSession(user);

    return { success: true, user, session };
  }

  async signOut(accessToken: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    sessions.delete(accessToken);
  }

  async refreshSession(refreshToken: string): Promise<RefreshResult> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In stub, we just create a new session
    // In real implementation, validate refresh token
    const newAccessToken = this.generateToken();
    const expiresAt = Date.now() + 3600 * 1000;

    return {
      success: true,
      session: {
        accessToken: newAccessToken,
        refreshToken,
        expiresAt,
      },
    };
  }

  async getCurrentUser(accessToken: string): Promise<User | null> {
    const sessionData = sessions.get(accessToken);

    if (!sessionData) {
      return null;
    }

    if (sessionData.expiresAt < Date.now()) {
      sessions.delete(accessToken);
      return null;
    }

    return sessionData.user;
  }

  // Helper for OAuth callback (stub only)
  async handleOAuthCallback(
    provider: OAuthProvider,
    _code: string
  ): Promise<AuthResult> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const email = provider === "google" ? "jean@gmail.com" : "jean@facebook.com";

    let stored = users.get(email);

    if (!stored) {
      const user: User = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        email,
        fullName: "Jean Dupont",
        credits: 0,
        createdAt: Date.now(),
      };
      stored = { user, password: "" };
      users.set(email, stored);
    }

    const session = this.createSession(stored.user);

    return { success: true, user: stored.user, session };
  }
}

export const authService = new StubAuthService();
