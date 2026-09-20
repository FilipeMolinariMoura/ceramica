import { cn } from "@/lib/utils";

/**
 * Revelação ao rolar.
 *
 * Era um componente de CLIENTE com IntersectionObserver. Virou um `div` com
 * um atributo: quem anima agora é o CSS, por `animation-timeline: view()`
 * (ver `app/globals.css`). Duas consequências:
 *
 * - sai JavaScript do navegador, e a revelação passa a acompanhar o scroll de
 *   verdade em vez de disparar de uma vez ao cruzar um limiar;
 * - onde o navegador não suporta (Firefox estável, hoje), o conteúdo aparece
 *   normalmente. O `@supports` em volta garante isso — é o contrário do
 *   padrão "opacity: 0 esperando JS", que deixa a página em branco quando o
 *   JS não roda.
 *
 * `tipo` escolhe COMO o bloco entra, e não é enfeite: foto escala sem
 * transladar, texto translada sem escalar, faixa só aparece. Sem isso o preço
 * entra na tela igual a um link de rodapé.
 *
 * `indice` desloca o início da revelação numa lista, produzindo o escalonamento
 * pela POSIÇÃO no scroll — não por tempo. Cartões lado a lado entram em
 * sequência conforme a pessoa rola, e param se ela parar.
 */
export function Reveal({
  children,
  className,
  tipo = "texto",
  indice,
}: {
  children: React.ReactNode;
  className?: string;
  tipo?: "titulo" | "texto" | "cartao" | "foto" | "faixa";
  indice?: number;
}) {
  return (
    <div
      data-revela={tipo}
      className={cn(className)}
      style={
        indice
          ? ({ "--i": indice } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
