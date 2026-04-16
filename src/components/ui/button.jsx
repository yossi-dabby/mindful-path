import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] border border-transparent text-[0.9375rem] font-medium leading-none tracking-[0.005em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[var(--shadow-md)] hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[var(--shadow-sm)] hover:bg-destructive/92 active:bg-destructive/96",
        outline:
          "border border-border/70 bg-[hsl(var(--card)/0.88)] text-secondary-foreground shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96",
        secondary:
          "border border-border/60 bg-secondary/88 text-secondary-foreground shadow-[var(--shadow-sm)] hover:bg-secondary/96 active:bg-secondary",
        ghost: "text-secondary-foreground shadow-none hover:bg-secondary/78 hover:text-foreground active:bg-secondary/88",
        link: "border-0 px-0 text-primary shadow-none underline-offset-4 hover:text-primary/80 hover:underline",
      },
      size: {
        default: "h-10 min-h-[44px] md:min-h-0 px-4 py-2",
        sm: "h-9 min-h-[44px] md:min-h-0 rounded-[var(--radius-control)] px-3 text-[0.875rem]",
        lg: "h-11 min-h-[44px] md:min-h-0 rounded-[var(--radius-control)] px-8",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 rounded-[var(--radius-control)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
