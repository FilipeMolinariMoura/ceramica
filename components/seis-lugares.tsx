import { cn } from "@/lib/utils";

const SEATS = [
  { x: 44, y: 45 },
  { x: 103, y: 56 },
  { x: 163, y: 61 },
  { x: 221, y: 61 },
  { x: 281, y: 56 },
  { x: 340, y: 45 },
] as const;

type Props = {
  className?: string;
  /** Anima a entrada dos lugares um a um. */
  animate?: boolean;
  /** Cor dos anéis: acento cobalto (padrão) ou claro para fundos escuros. */
  tone?: "cobalto" | "lona";
  caption?: string;
};

/**
 * Elemento-assinatura da página: as 6 vagas como objeto visual.
 * Seis lugares numa mesa — mostra a escassez sem escrever "restam poucas vagas".
 */
export function SeisLugares({
  className,
  animate = false,
  tone = "cobalto",
  caption = "seis lugares · uma turma",
}: Props) {
  const ring = tone === "cobalto" ? "var(--color-cobalto)" : "var(--color-lona)";
  const disc = tone === "cobalto" ? "var(--color-barro)" : "var(--color-lona-100)";
  const edge = tone === "cobalto" ? "var(--color-barro)" : "var(--color-lona)";

  return (
    <div className={cn("flex flex-col items-start gap-2.5", className)}>
      <svg
        viewBox="0 0 384 78"
        role="img"
        aria-label="Seis lugares numa mesa: representam as seis vagas da turma."
        className="w-full max-w-[19rem]"
      >
        {/* borda da mesa */}
        <path
          d="M34 40 C 128 70, 256 70, 350 40"
          fill="none"
          stroke={edge}
          strokeOpacity={0.28}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {SEATS.map((s, i) => (
          <g
            key={i}
            style={animate ? { animationDelay: `${0.15 + i * 0.09}s` } : undefined}
            className={
              animate
                ? "animate-[seat_0.5s_cubic-bezier(0.2,0.7,0.2,1)_both]"
                : undefined
            }
          >
            <circle cx={s.x} cy={s.y} r={15.5} fill="none" stroke={ring} strokeWidth={1.5} />
            <circle cx={s.x} cy={s.y} r={10} fill={disc} />
            <circle cx={s.x - 3} cy={s.y - 3.5} r={2.4} fill={ring} fillOpacity={0.35} />
          </g>
        ))}
      </svg>
      {caption ? (
        <span
          className={cn(
            "text-[0.68rem] font-semibold uppercase tracking-[0.22em]",
            tone === "cobalto" ? "text-barro/55" : "text-lona/70"
          )}
        >
          {caption}
        </span>
      ) : null}
    </div>
  );
}
