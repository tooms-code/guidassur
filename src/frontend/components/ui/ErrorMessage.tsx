"use client";

import { motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/frontend/lib/cn";

interface ErrorMessageProps {
  message: string | null | undefined;
  className?: string;
  animated?: boolean;
}

export function ErrorMessage({ message, className, animated = true }: ErrorMessageProps) {
  if (!message) return null;

  const content = (
    <div
      className={cn(
        "p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm",
        className
      )}
    >
      <AlertCircle size={18} className="flex-shrink-0" />
      <span>{message}</span>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
