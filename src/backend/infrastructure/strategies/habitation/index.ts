import { IStrategy } from "@/backend/domain/interfaces/IStrategy";
import { ResponsabiliteCivileStrategy } from "./ResponsabiliteCivileStrategy";
import { IncendieDegatsEauxStrategy } from "./IncendieDegatsEauxStrategy";
import { VolStrategy } from "./VolStrategy";
import { SecuriteStrategy } from "./SecuriteStrategy";
import { FranchiseHabStrategy } from "./FranchiseHabStrategy";
import { ValeurMobilierStrategy } from "./ValeurMobilierStrategy";
import { ObjetsValeurStrategy } from "./ObjetsValeurStrategy";
import { PrixSurfaceStrategy } from "./PrixSurfaceStrategy";

export const habitationStrategies: IStrategy[] = [
  new PrixSurfaceStrategy(),
  new ResponsabiliteCivileStrategy(),
  new IncendieDegatsEauxStrategy(),
  new VolStrategy(),
  new SecuriteStrategy(),
  new FranchiseHabStrategy(),
  new ValeurMobilierStrategy(),
  new ObjetsValeurStrategy(),
];
