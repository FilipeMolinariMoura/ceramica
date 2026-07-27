import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
  tone = "cobalto",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "cobalto" | "lona" | "barro";
}) {
  const color =
    tone === "lona"
      ? "text-lona/75"
      : tone === "barro"
        ? "text-barro/55"
        : "text-cobalto";
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.2em]",
        color,
        className
      )}
    >
      <span aria-hidden className="inline-block h-px w-7 bg-current opacity-55" />
      {children}
    </p>
  );
}
