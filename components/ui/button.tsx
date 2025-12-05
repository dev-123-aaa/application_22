"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-light transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-cyan-500 text-white hover:bg-cyan-400 shadow-sm shadow-cyan-500/20",
        outline:
          "border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 hover:shadow-sm hover:shadow-cyan-500/20",
        ghost: "text-gray-400 hover:text-white hover:bg-white/5",
        secondary:
          "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700",
        destructive:
          "bg-red-500 text-white hover:bg-red-400 shadow-sm shadow-red-500/20",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-md",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-10 px-6 rounded-md",
        icon: "h-9 w-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
