import {
  IUserService,
  GetAnalysesParams,
  GetAnalysesResult,
  UpdateProfileParams,
} from "@/backend/domain/interfaces/IUserService";
import { UserStats, UserSettings } from "@/backend/domain/entities/UserAnalysis";
import { getUserServiceProvider } from "@/backend/infrastructure/providers";

class UserService implements IUserService {
  private provider: IUserService;

  constructor() {
    this.provider = getUserServiceProvider();
  }

  async getAnalyses(params: GetAnalysesParams): Promise<GetAnalysesResult> {
    return this.provider.getAnalyses(params);
  }

  async getStats(userId: string): Promise<UserStats> {
    return this.provider.getStats(userId);
  }

  async getSettings(userId: string): Promise<UserSettings> {
    return this.provider.getSettings(userId);
  }

  async updateProfile(params: UpdateProfileParams): Promise<UserSettings> {
    return this.provider.updateProfile(params);
  }

  async deleteAccount(userId: string): Promise<void> {
    return this.provider.deleteAccount(userId);
  }

  // Credits management
  async getCredits(userId: string): Promise<number> {
    return this.provider.getCredits(userId);
  }

  async addCredits(userId: string, amount: number): Promise<number> {
    return this.provider.addCredits(userId, amount);
  }

  async useCredit(userId: string): Promise<{ success: boolean; remaining: number }> {
    return this.provider.useCredit(userId);
  }
}

export const userService = new UserService();
