import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-2xl border border-white/[0.12] bg-white/[0.08] px-4 text-sm text-foreground outline-none transition focus:border-primary focus:bg-white/[0.12]",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

