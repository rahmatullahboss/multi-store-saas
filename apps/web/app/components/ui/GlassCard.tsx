import { cn } from "~/utils/cn";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "hover" | "interactive";
  intensity?: "low" | "medium" | "high";
  gradient?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, variant = "default", intensity = "medium", gradient = false, ...props }, ref) => {
    
    const intensityStyles = {
      low: "bg-white/60 backdrop-blur-md border-white/20",
      medium: "bg-white/80 backdrop-blur-lg border-white/30",
      high: "bg-white/90 backdrop-blur-xl border-white/40",
    };

    const variantStyles = {
      default: "",
      hover: "transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-white/90",
      interactive: "cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border shadow-sm",
          intensityStyles[intensity],
          variantStyles[variant],
          gradient && "bg-gradient-to-br from-white/80 to-white/40",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
