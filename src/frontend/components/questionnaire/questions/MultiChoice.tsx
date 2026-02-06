"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { QuestionDto } from "@/backend/application/dtos/questionnaire.dto";
import { Button } from "@/frontend/components/ui/button";
import { Tooltip } from "@/frontend/components/ui/Tooltip";

interface MultiChoiceProps {
  question: QuestionDto;
  onAnswer: (answer: string[]) => void;
}

export function MultiChoice({ question, onAnswer }: MultiChoiceProps) {
  const [selected, setSelected] = useState<string[]>(
    (question.currentValue as string[]) || []
  );

  const toggleOption = (value: string) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleContinue = () => {
    onAnswer(selected);
  };

  const canContinue = !question.required || selected.length > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {question.options?.map((option, index) => {
          const isSelected = selected.includes(option.value);

          return (
            <motion.button
              key={option.value}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => toggleOption(option.value)}
              className={`
                w-full flex items-center justify-between p-4 rounded-xl border text-left
                transition-all duration-150
                ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }
              `}
            >
              <span
                className={`font-medium flex items-center ${
                  isSelected ? "text-emerald-700" : "text-gray-700"
                }`}
              >
                {option.label}
                {option.tooltip && <Tooltip content={option.tooltip} />}
              </span>
              <div
                className={`
                  w-5 h-5 rounded border flex items-center justify-center
                  transition-all duration-150
                  ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300"
                  }
                `}
              >
                {isSelected && <Check size={14} className="text-white" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      <Button
        onClick={handleContinue}
        disabled={!canContinue}
        className="w-full mt-6"
      >
        Continuer
      </Button>

      {!question.required && selected.length === 0 && (
        <p className="text-center text-sm text-gray-400">
          Tu peux passer cette question
        </p>
      )}
    </div>
  );
}
