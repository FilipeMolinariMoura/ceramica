import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * As variantes se chamam pelo PAPEL que cumprem, não pela cor que têm
 * (`solido`, `contorno`, `claro`). Antes eram `cobalto`/`contorno`/`claro`: na
 * troca de paleta, metade das chamadas do site pedia um botão "cobalto" que
 * havia virado vermelho, e o nome passou a mentir. Nome por função sobrevive à
 * próxima mudança de identidade.
 *
 * Reto e sem sombra colorida, de propósito: é o botão da referência — filete,
 * versalete e canto vivo. O `rounded-full` com brilho embaixo era parte do que
 * a Isabela chamou de "tia da cerâmica".
 */
const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-none font-semibold uppercase tracking-[0.12em] transition-[background-color,color,border-color,transform] duration-200 will-change-transform active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-3 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        solido:
          "bg-vermelho text-branco hover:bg-vermelho-escuro focus-visible:outline-vermelho",
        contorno:
          "border border-vermelho text-vermelho hover:bg-vermelho hover:text-branco focus-visible:outline-vermelho",
        claro:
          "bg-branco text-vermelho hover:bg-papel focus-visible:outline-branco",
      },
      size: {
        md: "h-11 px-6 text-[0.78rem]",
        lg: "h-[3.35rem] px-8 text-[0.85rem]",
      },
    },
    defaultVariants: { variant: "solido", size: "md" },
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

/** Mesmas variantes, para quando o alvo é um link e não um `<button>`. */
export const classesBotao = button;
