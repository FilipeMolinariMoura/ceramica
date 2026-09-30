"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * As portas lado a lado no desktop e em carrossel no celular.
 *
 * No celular, três cartões empilhados empurrariam dois deles para baixo da
 * dobra — e o pedido é ver as três chamadas ao entrar. Em carrossel, a
 * primeira aparece inteira e a ponta da segunda anuncia que há mais. Os
 * pontinhos embaixo dizem em qual se está, e tocar num deles leva até ele.
 *
 * O único JavaScript aqui é o do indicador. A rolagem e o encaixe são CSS
 * (`scroll-snap`), e sem JS o carrossel funciona igual — só sem os pontos
 * acompanhando.
 */
export function CarrosselPortas({ children }: { children: React.ReactNode }) {
  const trilho = React.useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = React.useState(0);
  const total = React.Children.count(children);

  React.useEffect(() => {
    const el = trilho.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const cartoes = Array.from(el.children) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) setAtivo(cartoes.indexOf(e.target as HTMLElement));
        }
      },
      { root: el, threshold: 0.6 }
    );
    cartoes.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  function irPara(i: number) {
    const el = trilho.current;
    const alvo = el?.children[i] as HTMLElement | undefined;
    if (!el || !alvo) return;
    el.scrollTo({ left: alvo.offsetLeft - el.offsetLeft - 24, behavior: "smooth" });
  }

  return (
    <div>
      <div
        ref={trilho}
        className="carrossel-portas flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 sm:grid sm:snap-none sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0"
      >
        {children}
      </div>

      <div className="mt-4 flex justify-center gap-2 sm:hidden" role="tablist" aria-label="Portas">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={ativo === i}
            aria-label={`Ir para a porta ${i + 1}`}
            onClick={() => irPara(i)}
            className={cn(
              "h-1.5 rounded-full transition-[width,background-color] duration-[var(--t-estado)] ease-[var(--ease-firme)]",
              ativo === i ? "w-6 bg-vermelho" : "w-1.5 bg-preto/25"
            )}
          />
        ))}
      </div>
    </div>
  );
}
