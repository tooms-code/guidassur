import {
  IUserService,
  GetAnalysesParams,
  GetAnalysesResult,
  UpdateProfileParams,
} from "@/backend/domain/interfaces/IUserService";
import { UserStats, UserSettings } from "@/backend/domain/entities/UserAnalysis";
import { stubUserService } from "@/backend/infrastructure/stubs/StubUserService";

class UserService implements IUserService {
  private provider: IUserService;

  constructor(provider: IUserService) {
    this.provider = provider;
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

  async deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
    return this.provider.deleteAccount(userId);
  }
}

export const userService = new UserService(stubUserService);
