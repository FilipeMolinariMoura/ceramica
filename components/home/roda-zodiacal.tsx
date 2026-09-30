/**
 * A roda do zodíaco, em traço: doze casas e os doze signos. Gira devagar
 * (dois minutos por volta) e para quando a pessoa pede menos movimento — ver
 * `.roda-gira` no globals.css.
 *
 * Os glifos levam U+FE0E (seletor de texto). Sem ele, iOS e Android desenham
 * ♈︎–♓︎ como emoji colorido, e a roda vira figurinha.
 */
const SIGNOS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

export function RodaZodiacal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden className={className} fill="none">
      <g className="roda-gira" stroke="currentColor">
        <circle cx="100" cy="100" r="96" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="78" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="40" strokeWidth="0.6" />
        {SIGNOS.map((signo, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const meio = ((i * 30 + 15) * Math.PI) / 180;
          return (
            <g key={signo}>
              <line
                x1={100 + 40 * Math.cos(a)}
                y1={100 + 40 * Math.sin(a)}
                x2={100 + 96 * Math.cos(a)}
                y2={100 + 96 * Math.sin(a)}
                strokeWidth="0.6"
              />
              <text
                x={100 + 87 * Math.cos(meio)}
                y={100 + 87 * Math.sin(meio)}
                fill="currentColor"
                stroke="none"
                fontSize="11"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="Georgia, serif"
              >
                {`${signo}︎`}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
