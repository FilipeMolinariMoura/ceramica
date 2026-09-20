import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { ARTISTA, FECHAMENTO, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/constants";
import { RETRATO, TIPO_ROTULO, TRAJETORIA } from "@/lib/trajetoria";

/**
 * "Conheça Isabela Molinari" — agora com as exposições que ela pediu.
 *
 * ── A pendência que ficou aberta por semanas ──────────────────────────────
 * Este componente tinha um link para `/sobre#exposicoes` e um comentário
 * explicando que a lista não existia, porque a regra do projeto é não
 * inventar linha de currículo. Estava certo: exposição que não aconteceu é o
 * tipo de erro que custa reputação, e quem for conferir não encontra.
 *
 * O portfólio de 2026 fechou a pendência. Cada linha abaixo sai da página 23
 * dele, e está em `lib/trajetoria.ts` para que `/sobre` leia a mesma fonte.
 *
 * ── Por que índice e não cartão ───────────────────────────────────────────
 * Currículo de artista se lê como índice: ano à esquerda, trabalho no meio,
 * lugar à direita, um filete entre as linhas. É como a própria Isabela
 * diagrama a última página do portfólio dela. Cinco cartões com foto
 * transformariam cinco fatos em cinco anúncios.
 *
 * O retrato entra pequeno e ao lado, não grande e em cima: aqui quem é o
 * assunto é o que ela fez, não a cara dela.
 */
export function ArtistaBreve() {
  return (
    <section className="bg-papel py-20 sm:py-24">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="flex flex-col gap-6">
          <p className="rotulo">Conheça</p>

          <Reveal tipo="foto">
            <div className="relative aspect-[3/4] w-full max-w-[17rem] overflow-hidden bg-osso/30">
              <Image
                src={RETRATO.foto}
                alt={RETRATO.alt}
                fill
                placeholder="blur"
                quality={90}
                sizes="(max-width: 1024px) 60vw, 22vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <div className="flex flex-col gap-2">
            <h2 className="titulo-secao versalete font-display text-vermelho">
              Isabela
              <br />
              Molinari
            </h2>
            <p className="versalete-larga text-[0.62rem] text-preto/50">
              {ARTISTA.titulo}
            </p>
          </div>

          <p className="max-w-sm text-[1rem] leading-relaxed text-cinza">
            {ARTISTA.formacao}, com pós-graduação em Arteterapia em curso.
            Ensina cerâmica há {ARTISTA.anosEnsinando} anos e mantém ateliê
            próprio em São Paulo.
          </p>

          {/* Esta seção terminava em dois links laterais — a trajetória e o
              Instagram — e era possível ler o currículo inteiro sem cruzar um
              caminho de compra. O currículo é justamente o argumento mais forte
              a favor do preço da aula, então é dele que se sai vendendo. Os
              dois links continuam, abaixo e menores. */}
          <Link
            href={FECHAMENTO}
            className="inline-flex h-[3.1rem] w-fit items-center justify-center bg-vermelho px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-branco transition-[background-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:bg-vermelho-escuro active:translate-y-px"
          >
            Ter aula com ela
          </Link>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[0.88rem]">
            <Link
              href="/sobre"
              className="border-b border-preto/20 pb-0.5 text-preto/60 transition-colors hover:border-preto/60"
            >
              A trajetória inteira
            </Link>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-preto/20 pb-0.5 text-preto/60 transition-colors hover:border-preto/60"
            >
              @{INSTAGRAM_HANDLE}
            </a>
          </div>
        </div>

        {/* O índice. `items-baseline` alinha o ano com o título, e não com o
            topo da caixa — sem isso o algarismo flutua acima da linha. */}
        <div className="lg:pt-10">
          <p className="rotulo mb-5">Exposições e residências</p>
          <ul>
            {TRAJETORIA.map((entrada, i) => (
              <Reveal key={entrada.id} indice={i} tipo="texto">
                <li className="grid grid-cols-[3.6rem_1fr] items-baseline gap-x-4 border-t border-linha py-5 last:border-b sm:grid-cols-[5rem_1fr] sm:gap-x-6">
                  <span className="numeral text-[0.92rem] text-vermelho">
                    {entrada.ano}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-[1.25rem] leading-tight text-preto sm:text-[1.45rem]">
                      {entrada.titulo}
                    </h3>
                    <p className="text-[0.88rem] leading-relaxed text-cinza">
                      {entrada.local} · {entrada.cidade}
                    </p>
                    <p className="versalete-larga mt-0.5 text-[0.58rem] text-preto/40">
                      {TIPO_ROTULO[entrada.tipo]}
                      {entrada.nota ? ` · ${entrada.nota}` : ""}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
