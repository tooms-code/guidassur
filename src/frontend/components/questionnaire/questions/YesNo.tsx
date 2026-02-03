"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { QuestionDto } from "@/backend/application/dtos/questionnaire.dto";

interface YesNoProps {
  question: QuestionDto;
  onAnswer: (answer: boolean) => void;
}

export function YesNo({ question, onAnswer }: YesNoProps) {
  const [selected, setSelected] = useState<boolean | null>(
    question.currentValue !== undefined ? (question.currentValue as boolean) : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (value: boolean) => {
    setSelected(value);
    setIsSubmitting(true);

    setTimeout(() => {
      onAnswer(value);
    }, 200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4"
    >
      <button
        type="button"
        onClick={() => handleSelect(true)}
        disabled={isSubmitting}
        className={`
          flex-1 py-5 rounded-xl border-2 font-semibold text-lg
          transition-all duration-150
          ${
            selected === true
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-gray-200 hover:border-gray-300 text-gray-700"
          }
          ${isSubmitting && selected !== true ? "opacity-50" : ""}
          disabled:cursor-not-allowed
        `}
      >
        Oui
      </button>
      <button
        type="button"
        onClick={() => handleSelect(false)}
        disabled={isSubmitting}
        className={`
          flex-1 py-5 rounded-xl border-2 font-semibold text-lg
          transition-all duration-150
          ${
            selected === false
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-gray-200 hover:border-gray-300 text-gray-700"
          }
          ${isSubmitting && selected !== false ? "opacity-50" : ""}
          disabled:cursor-not-allowed
        `}
      >
        Non
      </button>
    </motion.div>
  );
}
