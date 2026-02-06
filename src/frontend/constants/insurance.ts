import { Car, Home, Heart, Shield } from "lucide-react";
import { InsuranceType } from "@/shared/types/insurance";

export const insuranceIcons = {
  [InsuranceType.AUTO]: Car,
  [InsuranceType.HABITATION]: Home,
  [InsuranceType.GAV]: Shield,
  [InsuranceType.MUTUELLE]: Heart,
} as const;

export const insuranceLabels: Record<InsuranceType, string> = {
  [InsuranceType.AUTO]: "Auto",
  [InsuranceType.HABITATION]: "Habitation",
  [InsuranceType.GAV]: "Garantie Accidents de la Vie",
  [InsuranceType.MUTUELLE]: "Mutuelle",
};

export const insuranceTypes = [
  { type: InsuranceType.AUTO, label: "Auto", icon: Car },
  { type: InsuranceType.HABITATION, label: "Habitation", icon: Home },
  { type: InsuranceType.MUTUELLE, label: "Mutuelle", icon: Heart },
  { type: InsuranceType.GAV, label: "Garantie Accidents de la Vie", icon: Shield },
] as const;
