"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { QuestionDto } from "@/backend/application/dtos/questionnaire.dto";
import { Button } from "@/frontend/components/ui/button";

interface NumberInputProps {
  question: QuestionDto;
  onAnswer: (answer: number | null) => void;
}

export function NumberInput({ question, onAnswer }: NumberInputProps) {
  const [value, setValue] = useState<string>(
    question.currentValue !== undefined ? String(question.currentValue) : ""
  );
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9]/g, "");
    setValue(newValue);
    setError(null);
  };

  const handleContinue = () => {
    const numValue = value ? parseInt(value, 10) : null;

    if (question.required && numValue === null) {
      setError("Ce champ est requis");
      return;
    }

    if (numValue !== null) {
      if (question.min !== undefined && numValue < question.min) {
        setError(`La valeur minimum est ${question.min}`);
        return;
      }
      if (question.max !== undefined && numValue > question.max) {
        setError(`La valeur maximum est ${question.max}`);
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
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder || ""}
          className={`
            w-full text-center text-3xl font-semibold py-6 px-4
            border-2 rounded-xl bg-white
            focus:outline-none transition-colors duration-150
            ${
              error
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-emerald-500"
            }
          `}
          autoFocus
        />
        {question.unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 font-medium">
            {question.unit}
          </span>
        )}
      </div>

      {error && (
        <p className="text-center text-sm text-red-500">{error}</p>
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
