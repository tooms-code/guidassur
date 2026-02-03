import { Car, Home, Heart, Shield } from "lucide-react";
import Link from "next/link";
import { InsuranceType, insuranceLabels } from "@/shared/types/insurance";

const insuranceConfig = [
  { type: InsuranceType.AUTO, icon: Car },
  { type: InsuranceType.HABITATION, icon: Home },
  { type: InsuranceType.MUTUELLE, icon: Heart },
  { type: InsuranceType.GAV, icon: Shield },
];

export function InsurancePills() {
  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-4">
          {insuranceConfig.map(({ type, icon: Icon }) => (
            <Link
              key={type}
              href={`/questionnaire/${type}`}
              className="flex items-center gap-3 px-6 py-4 border border-gray-200 rounded-lg hover:border-emerald-500 transition-colors duration-150"
            >
              <Icon size={20} className="text-gray-400" strokeWidth={1.5} />
              <span className="text-sm text-gray-700">{insuranceLabels[type]}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
