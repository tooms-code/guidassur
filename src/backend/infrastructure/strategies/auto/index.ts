import { IStrategy } from "@/backend/domain/interfaces/IStrategy";
import { FranchiseStrategy } from "./FranchiseStrategy";
import { BrisGlaceStrategy } from "./BrisGlaceStrategy";
import { VolIncendieStrategy } from "./VolIncendieStrategy";
import { AssistanceStrategy } from "./AssistanceStrategy";
import { VehiculeRemplacementStrategy } from "./VehiculeRemplacementStrategy";
import { ProtectionJuridiqueStrategy } from "./ProtectionJuridiqueStrategy";
import { PrimeCreditStrategy } from "./PrimeCreditStrategy";
import { PrixAgeVehiculeStrategy } from "./PrixAgeVehiculeStrategy";

export const autoStrategies: IStrategy[] = [
  new PrixAgeVehiculeStrategy(),
  new FranchiseStrategy(),
  new BrisGlaceStrategy(),
  new VolIncendieStrategy(),
  new AssistanceStrategy(),
  new VehiculeRemplacementStrategy(),
  new ProtectionJuridiqueStrategy(),
  new PrimeCreditStrategy(),
];
