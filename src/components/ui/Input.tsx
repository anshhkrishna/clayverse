"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-earth-700"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 text-earth-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-lg border bg-white px-3 py-2 text-sm text-earth-900 placeholder:text-earth-400",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-clay-500 focus:border-clay-500",
              "disabled:bg-earth-50 disabled:cursor-not-allowed disabled:opacity-60",
              error
                ? "border-kiln-500 focus:ring-kiln-500 focus:border-kiln-500"
                : "border-earth-200 hover:border-earth-300",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="pointer-events-none absolute right-3 text-earth-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-kiln-600">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-earth-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
