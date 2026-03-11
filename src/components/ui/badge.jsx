import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-chip)] border px-2.5 py-1 text-[0.75rem] font-medium leading-4 tracking-[0.01em] transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1",
  {
    variants: {
      variant: {
        default:
          "border-primary/12 bg-primary/10 text-primary",
        secondary:
          "border-border/70 bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive/12 text-destructive",
        success:
          "border-transparent bg-success/14 text-success",
        warning:
          "border-transparent bg-warning/16 text-[hsl(var(--accent-foreground))]",
        outline: "border-border/80 bg-card text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };