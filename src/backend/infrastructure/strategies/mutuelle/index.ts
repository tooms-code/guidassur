import { IStrategy } from "@/backend/domain/interfaces/IStrategy";
import { ResteAChargeStrategy } from "./ResteAChargeStrategy";
import { HospitalisationStrategy } from "./HospitalisationStrategy";
import { OptiqueStrategy } from "./OptiqueStrategy";
import { DentaireStrategy } from "./DentaireStrategy";
import { DepassementsStrategy } from "./DepassementsStrategy";
import { PrixAgeStrategy } from "./PrixAgeStrategy";

export const mutuelleStrategies: IStrategy[] = [
  new PrixAgeStrategy(),
  new ResteAChargeStrategy(),
  new HospitalisationStrategy(),
  new OptiqueStrategy(),
  new DentaireStrategy(),
  new DepassementsStrategy(),
];
