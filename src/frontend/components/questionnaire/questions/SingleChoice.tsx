"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { QuestionDto } from "@/backend/application/dtos/questionnaire.dto";

interface SingleChoiceProps {
  question: QuestionDto;
  onAnswer: (answer: string) => void;
}

export function SingleChoice({ question, onAnswer }: SingleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(
    (question.currentValue as string) || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (value: string) => {
    setSelected(value);
    setIsSubmitting(true);

    // Small delay for visual feedback
    setTimeout(() => {
      onAnswer(value);
    }, 200);
  };

  return (
    <div className="space-y-3">
      {question.options?.map((option, index) => {
        const isSelected = selected === option.value;

        return (
          <motion.button
            key={option.value}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleSelect(option.value)}
            disabled={isSubmitting}
            className={`
              w-full flex items-center justify-between p-4 rounded-xl border-2 text-left
              transition-all duration-150
              ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }
              ${isSubmitting && !isSelected ? "opacity-50" : ""}
              disabled:cursor-not-allowed
            `}
          >
            <span
              className={`font-medium ${
                isSelected ? "text-emerald-700" : "text-gray-700"
              }`}
            >
              {option.label}
            </span>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
              >
                <Check size={14} className="text-white" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
