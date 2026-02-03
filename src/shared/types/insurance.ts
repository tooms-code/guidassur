export enum InsuranceType {
  AUTO = "auto",
  HABITATION = "habitation",
  MUTUELLE = "mutuelle",
  GAV = "gav",
}

export const insuranceLabels: Record<InsuranceType, string> = {
  [InsuranceType.AUTO]: "Assurance Auto",
  [InsuranceType.HABITATION]: "Assurance Habitation",
  [InsuranceType.MUTUELLE]: "Mutuelle Santé",
  [InsuranceType.GAV]: "Garantie Accidents de la Vie",
};
