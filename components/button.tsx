import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-[background-color,color,transform] duration-200 will-change-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-3 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        cobalto:
          "bg-cobalto text-lona-100 hover:bg-cobalto-700 focus-visible:outline-cobalto shadow-[0_14px_30px_-16px_rgba(29,79,160,0.85)]",
        contorno:
          "border border-barro/25 text-barro hover:border-barro hover:bg-barro hover:text-lona focus-visible:outline-barro",
        claro:
          "bg-lona-100 text-barro hover:bg-white focus-visible:outline-cobalto",
      },
      size: {
        md: "h-11 px-6 text-[0.95rem]",
        lg: "h-[3.35rem] px-8 text-base",
      },
    },
    defaultVariants: { variant: "cobalto", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(button({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
