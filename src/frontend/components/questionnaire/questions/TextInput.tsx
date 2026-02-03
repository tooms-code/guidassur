"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { QuestionDto } from "@/backend/application/dtos/questionnaire.dto";
import { Button } from "@/frontend/components/ui/button";

interface TextInputProps {
  question: QuestionDto;
  onAnswer: (answer: string) => void;
}

export function TextInput({ question, onAnswer }: TextInputProps) {
  const [value, setValue] = useState<string>(
    (question.currentValue as string) || ""
  );

  const handleContinue = () => {
    onAnswer(value);
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
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={question.placeholder || ""}
        className="
          w-full text-center text-xl py-4 px-4
          border-2 border-gray-200 rounded-xl bg-white
          focus:outline-none focus:border-emerald-500
          transition-colors duration-150
        "
        autoFocus
      />

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
