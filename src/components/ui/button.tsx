import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/95 hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] hover:brightness-110 active:translate-y-0 active:scale-95 transition-all duration-200",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/95 hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] hover:brightness-110 active:translate-y-0 active:scale-95 transition-all duration-200",
        outline: "border border-input bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/80 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-lg active:translate-y-0 active:scale-95 transition-all duration-200",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-lg hover:border-border active:translate-y-0 active:scale-95 transition-all duration-200",
        ghost: "hover:bg-primary/15 hover:text-primary hover:scale-110 active:scale-95 rounded-2xl transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 hover:scale-105 transition-all duration-200",
        hero: "bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/95 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.04] hover:brightness-115 active:translate-y-0 active:scale-95 rounded-full transition-all duration-300",
        accent: "bg-accent text-accent-foreground font-semibold hover:bg-accent/90 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-lg active:translate-y-0 active:scale-95 transition-all duration-200",
        success: "bg-success text-success-foreground font-semibold shadow-sm hover:bg-success/95 hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] hover:brightness-110 active:translate-y-0 active:scale-95 transition-all duration-200",
        "outline-hero": "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.04] active:translate-y-0 active:scale-95 rounded-full transition-all duration-300",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-2xl",
        sm: "h-9 rounded-xl px-4",
        lg: "h-12 rounded-2xl px-8 text-base",
        xl: "h-14 rounded-full px-10 text-base",
        icon: "h-10 w-10 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
