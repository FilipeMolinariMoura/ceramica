import { cn } from "@/lib/utils";

/**
 * A linha curta acima do título, com o filete à esquerda.
 *
 * `tone` diz sobre que fundo ela está, não que cor ela tem — `claro` é para
 * fundo escuro ou foto, `escuro` para quando o vermelho competiria com um
 * título vermelho logo abaixo.
 */
export function Eyebrow({
  children,
  className,
  tone = "padrao",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "padrao" | "claro" | "escuro";
}) {
  const color =
    tone === "claro"
      ? "text-papel/80"
      : tone === "escuro"
        ? "text-preto/55"
        : "text-vermelho";
  return (
    <p
      className={cn(
        "versalete-larga flex items-center gap-3 text-[0.7rem]",
        color,
        className
      )}
    >
      <span aria-hidden className="inline-block h-px w-7 bg-current opacity-55" />
      {children}
    </p>
  );
}
