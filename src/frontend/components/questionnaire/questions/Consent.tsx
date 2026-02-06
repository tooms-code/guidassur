"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { QuestionDto } from "@/backend/application/dtos/questionnaire.dto";
import { Button } from "@/frontend/components/ui/button";

interface ConsentProps {
  question: QuestionDto;
  onAnswer: (answer: boolean) => void;
}

export function Consent({ question, onAnswer }: ConsentProps) {
  const [checked, setChecked] = useState(
    (question.currentValue as boolean) || false
  );

  const handleContinue = () => {
    onAnswer(checked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div
        className="w-full flex items-start gap-4 p-4 rounded-xl border border-gray-200 text-left"
      >
        <button
          type="button"
          onClick={() => setChecked(!checked)}
          className={`
            w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5
            transition-all duration-150
            ${
              checked
                ? "border-emerald-500 bg-emerald-500"
                : "border-gray-300 hover:border-gray-400"
            }
          `}
        >
          {checked && <Check size={12} className="text-white" />}
        </button>
        <span className="text-gray-700">
          J'ai lu et j'accepte la{" "}
          <Link
            href="/politique-confidentialite"
            target="_blank"
            className="text-emerald-500 hover:text-emerald-600 underline"
            onClick={(e) => e.stopPropagation()}
          >
            politique de confidentialité
          </Link>
        </span>
      </div>

      <Button
        onClick={handleContinue}
        disabled={question.required && !checked}
        className="w-full"
      >
        Voir mes résultats
      </Button>
    </motion.div>
  );
}
