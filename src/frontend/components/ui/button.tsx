import { cn } from "@/shared/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700":
              variant === "primary",
            "bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50":
              variant === "secondary",
            "text-gray-500 hover:text-gray-900": variant === "ghost",
          },
          {
            "text-sm px-3 py-1.5 rounded-md": size === "sm",
            "text-sm px-5 py-2.5 rounded-lg": size === "md",
            "text-base px-7 py-3 rounded-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
