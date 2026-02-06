import { IStrategy } from "@/backend/domain/interfaces/IStrategy";
import { CapitalInvaliditeStrategy } from "./CapitalInvaliditeStrategy";
import { TauxMinimumStrategy } from "./TauxMinimumStrategy";
import { EnfantsStrategy } from "./EnfantsStrategy";
import { SportsRisqueStrategy } from "./SportsRisqueStrategy";
import { PrixAgeGAVStrategy } from "./PrixAgeGAVStrategy";

export const gavStrategies: IStrategy[] = [
  new PrixAgeGAVStrategy(),
  new CapitalInvaliditeStrategy(),
  new TauxMinimumStrategy(),
  new EnfantsStrategy(),
  new SportsRisqueStrategy(),
];
