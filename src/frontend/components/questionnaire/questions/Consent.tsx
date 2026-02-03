"use client";

import { useState } from "react";
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
      <button
        type="button"
        onClick={() => setChecked(!checked)}
        className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-left transition-all duration-150"
      >
        <div
          className={`
            w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5
            transition-all duration-150
            ${
              checked
                ? "border-emerald-500 bg-emerald-500"
                : "border-gray-300"
            }
          `}
        >
          {checked && <Check size={14} className="text-white" />}
        </div>
        <span className="text-gray-700">{question.label}</span>
      </button>

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
