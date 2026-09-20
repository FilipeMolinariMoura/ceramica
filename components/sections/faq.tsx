import { Container } from "@/components/section";
import { CabecalhoSecao } from "@/components/cabecalho-secao";
import { Reveal } from "@/components/reveal";

const PERGUNTAS = [
  {
    q: "Preciso ter experiência?",
    a: "Não. A turma recebe iniciantes e o acompanhamento é individual.",
  },
  {
    q: "Tem horário de manhã e de tarde?",
    a: "Sim. As duas turmas são às terças: uma de manhã (9h30 às 11h30) e outra de tarde (13h30 às 15h30). Você escolhe o horário na inscrição.",
  },
  {
    q: "Preciso comprar ferramentas?",
    a: "Não. Todas as ferramentas estão inclusas.",
  },
  {
    q: "E a queima das peças?",
    a: "Está inclusa: a queima de baixa temperatura e a de esmalte.",
  },
  {
    q: "Preciso comprar argila?",
    a: "A argila e os esmaltes são por conta do aluno. Nas duas primeiras aulas eu forneço.",
  },
  {
    q: "Quantas aulas por mês?",
    a: "Uma por semana, sempre às terças. Alguns meses têm quatro terças, outros cinco. A mensalidade é a mesma.",
  },
];

/**
 * FAQ no formato da referência: perguntas NUMERADAS, em vermelho, pequenas e
 * em peso médio, separadas por um filete fino, com o `+` à direita.
 *
 * Antes era pergunta grande em preto num bloco de duas colunas com um rótulo
 * de lado. Correto e genérico. A numeração é o que faz aquilo parecer índice
 * de impresso, e é de graça.
 */
export function Faq() {
  return (
    <section className="creme py-20 sm:py-24">
      <CabecalhoSecao
        titulo="Perguntas frequentes"
        subtitulo="O que perguntam antes de reservar."
        className="mb-10"
      />

      <Container className="max-w-2xl">
        {PERGUNTAS.map((item, i) => (
          <Reveal key={item.q} indice={i} tipo="cartao">
            <details className="group border-t border-borda last:border-b">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-5 py-4 [&::-webkit-details-marker]:hidden">
                <span className="flex gap-2.5 text-[0.95rem] font-medium text-realce">
                  <span aria-hidden className="tabular-nums">
                    {i + 1}.
                  </span>
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className="faq-plus shrink-0 select-none text-xl font-light leading-none text-realce transition-transform duration-[var(--t-estado)]"
                >
                  +
                </span>
              </summary>
              <p className="-mt-1 pb-5 pl-6 text-[0.95rem] leading-relaxed text-texto/70">
                {item.a}
              </p>
            </details>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}
