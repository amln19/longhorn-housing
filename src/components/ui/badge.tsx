import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "outline"
    | "destructive";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default:
        "bg-burnt-orange/10 text-burnt-orange border border-burnt-orange/20",
      secondary: "bg-gray-100 text-gray-700 border border-gray-200",
      success: "bg-green-50 text-green-700 border border-green-200",
      warning: "bg-amber-50 text-amber-700 border border-amber-200",
      outline: "border-2 border-gray-300 text-gray-600 bg-white",
      destructive: "bg-red-50 text-red-700 border border-red-200",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";

export { Badge };
