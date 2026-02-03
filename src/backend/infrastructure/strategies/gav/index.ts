import { IStrategy } from "@/backend/domain/interfaces/IStrategy";
import { CapitalInvaliditeStrategy } from "./CapitalInvaliditeStrategy";
import { TauxMinimumStrategy } from "./TauxMinimumStrategy";
import { EnfantsStrategy } from "./EnfantsStrategy";
import { SportsRisqueStrategy } from "./SportsRisqueStrategy";

export const gavStrategies: IStrategy[] = [
  new CapitalInvaliditeStrategy(),
  new TauxMinimumStrategy(),
  new EnfantsStrategy(),
  new SportsRisqueStrategy(),
];
