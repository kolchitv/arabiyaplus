import * as React from "react";
import { cn } from "@/utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-ash/30 bg-white/70 dark:bg-ink-light/40 px-3 py-2 text-sm font-ui text-ink dark:text-white placeholder:text-ash focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber transition-shadow",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-xl border border-ash/30 bg-white/70 dark:bg-ink-light/40 px-3 py-2 text-sm font-ui text-ink dark:text-white placeholder:text-ash focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber transition-shadow",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
