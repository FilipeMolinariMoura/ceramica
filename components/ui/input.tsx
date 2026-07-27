"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "h-12 w-full rounded-xl border border-barro/15 bg-white/70 px-4 text-[1rem] text-barro placeholder:text-barro/35",
      "transition-colors focus:border-cobalto focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalto/25",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
