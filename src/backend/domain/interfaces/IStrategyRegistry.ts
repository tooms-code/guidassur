import { IStrategy } from "./IStrategy";
import { InsuranceType } from "@/shared/types/insurance";

export interface IStrategyRegistry {
  getStrategies(type: InsuranceType): IStrategy[];
  register(type: InsuranceType, strategy: IStrategy): void;
  registerStrategy(type: InsuranceType, strategy: IStrategy): void;
}
