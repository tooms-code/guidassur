import { UserAnalysis, UserStats, UserSettings } from "@/backend/domain/entities/UserAnalysis";
import { InsuranceType } from "@/shared/types/insurance";

export type AnalysisSortField = "date" | "score" | "type";
export type SortOrder = "asc" | "desc";

export interface GetAnalysesParams {
  userId: string;
  insuranceType?: InsuranceType;
  isUnlocked?: boolean;
  sortBy?: AnalysisSortField;
  sortOrder?: SortOrder;
  limit?: number;
  offset?: number;
}

export interface GetAnalysesResult {
  analyses: UserAnalysis[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface UpdateProfileParams {
  userId: string;
  fullName?: string;
  phone?: string;
  emailNotifications?: boolean;
}

// User data service - NOT auth (auth is handled by IAuthProvider/Supabase Auth)
export interface IUserService {
  getAnalyses(params: GetAnalysesParams): Promise<GetAnalysesResult>;
  getStats(userId: string): Promise<UserStats>;
  getSettings(userId: string): Promise<UserSettings>;
  updateProfile(params: UpdateProfileParams): Promise<UserSettings>;
  deleteAccount(userId: string): Promise<void>;

  // Credits management
  getCredits(userId: string): Promise<number>;
  addCredits(userId: string, amount: number): Promise<number>;
  useCredit(userId: string): Promise<{ success: boolean; remaining: number }>;
}
