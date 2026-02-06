import { Loader2 } from "lucide-react";
import { cn } from "@/frontend/lib/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Use border style instead of icon */
  variant?: "icon" | "border";
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

const iconSizes = {
  sm: 16,
  md: 32,
  lg: 48,
};

export function Spinner({ size = "md", className, variant = "icon" }: SpinnerProps) {
  if (variant === "border") {
    return (
      <div
        className={cn(
          sizeClasses[size],
          "border border-emerald-500 border-t-transparent rounded-full animate-spin",
          className
        )}
      />
    );
  }

  return (
    <Loader2
      size={iconSizes[size]}
      className={cn("animate-spin text-emerald-500", className)}
    />
  );
}

interface SpinnerPageProps {
  variant?: "icon" | "border";
}

export function SpinnerPage({ variant = "border" }: SpinnerPageProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Spinner variant={variant} />
    </div>
  );
}
