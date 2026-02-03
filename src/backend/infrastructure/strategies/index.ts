import { InsuranceType } from "@/shared/types/insurance";
import { StrategyRegistry } from "@/backend/application/engine/StrategyRegistry";
import { autoStrategies } from "./auto";
import { habitationStrategies } from "./habitation";
import { gavStrategies } from "./gav";
import { mutuelleStrategies } from "./mutuelle";

// Create and populate the global registry
const registry = new StrategyRegistry();

// Register all strategies by insurance type
autoStrategies.forEach((strategy) => {
  registry.register(InsuranceType.AUTO, strategy);
});

habitationStrategies.forEach((strategy) => {
  registry.register(InsuranceType.HABITATION, strategy);
});

gavStrategies.forEach((strategy) => {
  registry.register(InsuranceType.GAV, strategy);
});

mutuelleStrategies.forEach((strategy) => {
  registry.register(InsuranceType.MUTUELLE, strategy);
});

export { registry };
