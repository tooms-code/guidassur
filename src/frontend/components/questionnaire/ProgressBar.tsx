"use client";

import { motion } from "motion/react";
import { ProgressDto } from "@/backend/application/dtos/questionnaire.dto";

interface ProgressBarProps {
  progress: ProgressDto;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full h-1 bg-gray-100">
      <motion.div
        className="h-full bg-emerald-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress.percent}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
}
