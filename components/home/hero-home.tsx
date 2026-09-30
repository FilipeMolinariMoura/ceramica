import { Container } from "@/components/section";
import { ARTISTA, SITE } from "@/lib/constants";

/**
 * A ABERTURA DA PÁGINA INICIAL — uma faixa, não uma dobra.
 *
 * ── Por que encolheu ──────────────────────────────────────────────────────
 * O nome em cartaz e uma obra ocupavam a primeira tela inteira, e as três
 * portas começavam abaixo dela. Quem chegava do Instagram via um nome e uma
 * foto e tinha de ROLAR para descobrir o que podia fazer ali. O pedido agora
 * é o oposto: entrou, já vê as três chamadas.
 *
 * O nome continua sendo a primeira coisa — o site é dela —, mas numa linha, e
 * a obra que estava aqui passou a morar dentro da porta da artista, onde ela
 * é argumento em vez de capa.
 */
export function HeroHome() {
  return (
    <section className="bg-papel pb-5 pt-[5.6rem] sm:pb-7 sm:pt-[6.4rem]">
      <Container>
        <div
          data-enter
          className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        >
          <h1 className="font-display text-[clamp(2.1rem,6.4vw,3.6rem)] font-semibold leading-[0.95] tracking-[-0.02em] text-preto">
            Isabela <em className="italic text-vermelho">Molinari</em>
          </h1>
          <p className="versalete-larga text-[0.6rem] text-preto/55">
            {ARTISTA.titulo} · {SITE.bairro}
          </p>
        </div>
      </Container>
    </section>
  );
}
