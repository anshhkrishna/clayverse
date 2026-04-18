"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  noPadding?: boolean;
}

function Card({ className, hover = false, noPadding = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-clay-50 clay-shadow border border-earth-100",
        hover &&
          "transition-all duration-200 hover:-translate-y-1 hover:clay-shadow-md cursor-pointer",
        !noPadding && "p-4",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1 pb-3 border-b border-earth-100", className)}
      {...props}
    />
  );
}

function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("py-3", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-2 pt-3 border-t border-earth-100", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardBody, CardFooter };
