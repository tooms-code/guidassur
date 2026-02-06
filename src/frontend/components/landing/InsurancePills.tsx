"use client";

import { Car, Home, Heart, Shield } from "lucide-react";
import { InsuranceType, insuranceLabels } from "@/shared/types/insurance";
import { motion } from "motion/react";

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
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm text-gray-400 text-center mb-5"
        >
          Types d'assurance pris en charge
        </motion.p>
        <div className="flex flex-wrap justify-center gap-3">
          {insuranceConfig.map(({ type, icon: Icon }, index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 rounded-full"
            >
              <Icon size={16} className="text-gray-400" strokeWidth={1.5} />
              <span className="text-sm text-gray-600">{insuranceLabels[type]}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
