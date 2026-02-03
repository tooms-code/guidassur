"use client";

import { Info, Lightbulb, AlertTriangle, Coins } from "lucide-react";

interface TipDto {
  text: string;
  icon?: string;
}

interface QuestionTipProps {
  tip: TipDto;
}

const iconMap: Record<string, typeof Info> = {
  info: Info,
  lightbulb: Lightbulb,
  alert: AlertTriangle,
  money: Coins,
};

export function QuestionTip({ tip }: QuestionTipProps) {
  const Icon = iconMap[tip.icon || "info"];

  return (
    <div className="flex gap-3 p-4 bg-gray-50 rounded-lg mt-4">
      <Icon size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-gray-500 leading-relaxed">{tip.text}</p>
    </div>
  );
}
