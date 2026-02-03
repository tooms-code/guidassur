import { IStrategy } from "@/backend/domain/interfaces/IStrategy";
import { IStrategyRegistry } from "@/backend/domain/interfaces/IStrategyRegistry";
import { InsuranceType } from "@/shared/types/insurance";

export class StrategyRegistry implements IStrategyRegistry {
  private strategies: Map<InsuranceType, IStrategy[]> = new Map();

  constructor() {
    this.strategies.set(InsuranceType.AUTO, []);
    this.strategies.set(InsuranceType.HABITATION, []);
    this.strategies.set(InsuranceType.GAV, []);
    this.strategies.set(InsuranceType.MUTUELLE, []);
  }

  getStrategies(type: InsuranceType): IStrategy[] {
    return this.strategies.get(type) || [];
  }

  register(type: InsuranceType, strategy: IStrategy): void {
    const existing = this.strategies.get(type) || [];
    existing.push(strategy);
    this.strategies.set(type, existing);
  }

  registerStrategy(type: InsuranceType, strategy: IStrategy): void {
    this.register(type, strategy);
  }

  registerStrategies(type: InsuranceType, strategies: IStrategy[]): void {
    for (const strategy of strategies) {
      this.register(type, strategy);
    }
  }
}
