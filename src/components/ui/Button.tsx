"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-clay-500 text-white hover:bg-clay-600 active:bg-clay-700 clay-shadow",
        secondary:
          "bg-earth-100 text-earth-800 hover:bg-earth-200 active:bg-earth-300 border border-earth-200",
        ghost:
          "bg-transparent text-earth-700 hover:bg-clay-100 active:bg-clay-200",
        danger:
          "bg-kiln-600 text-white hover:bg-kiln-700 active:bg-kiln-800 clay-shadow",
        outline:
          "bg-transparent border border-earth-300 text-earth-700 hover:bg-earth-50 hover:border-earth-400 active:bg-earth-100",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        md: "h-9 px-4 text-sm rounded-lg",
        lg: "h-11 px-6 text-base rounded-xl",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
