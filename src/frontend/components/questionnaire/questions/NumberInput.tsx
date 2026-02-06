"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { QuestionDto } from "@/backend/application/dtos/questionnaire.dto";
import { Button } from "@/frontend/components/ui/button";

interface NumberInputProps {
  question: QuestionDto;
  onAnswer: (answer: number | null) => void;
  error?: string | null;
}

export function NumberInput({ question, onAnswer, error: externalError }: NumberInputProps) {
  const [value, setValue] = useState<string>(
    question.currentValue !== undefined ? String(question.currentValue) : ""
  );
  const [localError, setLocalError] = useState<string | null>(null);

  // Combine external (backend validation) and local (frontend validation) errors
  const displayError = externalError || localError;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9]/g, "");
    setValue(newValue);
    setLocalError(null);
    // Note: externalError will be cleared when the answer is resubmitted
  };

  const handleContinue = () => {
    const numValue = value ? parseInt(value, 10) : null;

    if (question.required && numValue === null) {
      setLocalError("Ce champ est requis");
      return;
    }

    if (numValue !== null) {
      if (question.min !== undefined && numValue < question.min) {
        setLocalError(`La valeur minimum est ${question.min}`);
        return;
      }
      if (question.max !== undefined && numValue > question.max) {
        setLocalError(`La valeur maximum est ${question.max}`);
        return;
      }
    }

    onAnswer(numValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleContinue();
    }
  };

  const canContinue = !question.required || value.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="relative">
        {question.unit && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 font-medium">
            {question.unit}
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder || ""}
          className={`
            w-full text-center text-2xl font-semibold py-4 ${question.unit ? "pl-10 pr-4" : "px-4"}
            border rounded-xl bg-white
            focus:outline-none transition-colors duration-150
            ${
              displayError
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-emerald-500"
            }
          `}
          autoFocus
        />
      </div>

      {displayError && (
        <p className="text-center text-sm text-red-500">{displayError}</p>
      )}

      {question.min !== undefined && question.max !== undefined && (
        <p className="text-center text-sm text-gray-400">
          Entre {question.min} et {question.max}
        </p>
      )}

      <Button
        onClick={handleContinue}
        disabled={!canContinue}
        className="w-full"
      >
        Continuer
      </Button>
    </motion.div>
  );
}
