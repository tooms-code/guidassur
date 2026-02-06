"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import type { LucideIcon } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  icon?: LucideIcon;
  color?: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

const colorVariants: Record<string, { bg: string; text: string; border: string }> = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
  },
  gray: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
  },
};

export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        const colors = colorVariants[item.color || "gray"];
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            className={cn(
              "rounded-xl border transition-all duration-200",
              isOpen ? colors.border : "border-gray-200",
              isOpen ? colors.bg : "bg-white"
            )}
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              {Icon && (
                <div
                  className={cn(
                    "p-2 rounded-lg transition-colors duration-200",
                    isOpen ? colors.bg : "bg-gray-100",
                    isOpen ? colors.text : "text-gray-500"
                  )}
                >
                  <Icon size={20} strokeWidth={1.5} />
                </div>
              )}
              <span
                className={cn(
                  "flex-1 font-medium transition-colors duration-200",
                  isOpen ? "text-gray-900" : "text-gray-700"
                )}
              >
                {item.title}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "transition-colors duration-200",
                  isOpen ? colors.text : "text-gray-400"
                )}
              >
                <ChevronDown size={20} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
