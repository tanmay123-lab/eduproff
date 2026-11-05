import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/95 hover:shadow-lg hover:-translate-y-1 hover:brightness-105 active:translate-y-0 active:scale-[0.97]",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/95 hover:shadow-lg hover:-translate-y-1 hover:brightness-105 active:translate-y-0 active:scale-[0.97]",
        outline: "border border-input bg-background hover:bg-primary/5 hover:text-primary hover:border-primary/60 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-[0.97]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:-translate-y-1 hover:shadow-md hover:border-border active:translate-y-0 active:scale-[0.97]",
        ghost: "hover:bg-primary/10 hover:text-primary hover:scale-105 active:scale-95",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 hover:scale-105",
        hero: "bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/95 hover:shadow-2xl hover:-translate-y-1.5 hover:scale-[1.02] hover:brightness-110 active:translate-y-0 active:scale-95",
        accent: "bg-accent text-accent-foreground font-semibold hover:bg-accent/90 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-[0.97]",
        success: "bg-success text-success-foreground font-semibold shadow-sm hover:bg-success/95 hover:shadow-lg hover:-translate-y-1 hover:brightness-105 active:translate-y-0 active:scale-[0.97]",
        "outline-hero": "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] active:translate-y-0 active:scale-95",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-base",
        icon: "h-10 w-10",
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
