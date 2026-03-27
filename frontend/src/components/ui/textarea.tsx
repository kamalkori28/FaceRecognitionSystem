import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-2xl border border-white/[0.12] bg-white/[0.08] px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:bg-white/[0.12]",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";

