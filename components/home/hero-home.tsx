import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/section";
import { fotos } from "@/lib/fotos";
import { reais, servicoPorSlug } from "@/lib/agenda";
import { SERVICO_AULA_AVULSA, SITE } from "@/lib/constants";

/**
 * Abertura: o nome grande em versalete vermelho sobre creme, e a foto inteira
 * logo abaixo — a composição da referência.
 *
 * A versão anterior era uma foto de tela cheia com o texto por cima e nenhum
 * preço à vista. Bonita, e não vendia: quem chegava do Instagram não
 * descobria o que custava nem o que dava para marcar sem rolar a página.
 * Agora a primeira dobra diz o que é, quanto custa e onde clicar.
 */
export async function HeroHome() {
  const servico = await servicoPorSlug(SERVICO_AULA_AVULSA);
  const preco = servico ? reais(servico.precoCentavos) : null;

  return (
    <section className="bg-papel pt-[6.5rem] sm:pt-[7.5rem]">
      <Container>
        <div data-enter className="flex flex-col gap-6">
          <p className="versalete-larga text-[0.68rem] text-preto/55">
            Ateliê de cerâmica · {SITE.cidade}
          </p>

          <h1 className="versalete font-display text-[2.6rem] leading-[0.95] text-vermelho sm:text-[4.2rem] lg:text-[5.6rem]">
            Bela Cerâmica
          </h1>

          <div className="flex flex-col gap-5 border-t border-linha pt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
            <p className="max-w-md text-[1.05rem] leading-relaxed text-grafite">
              Aulas, oficinas e peças autorais com {SITE.artista}, artista
              visual e arteterapeuta. {preco ? `Aula avulsa ${preco}.` : ""}
            </p>

            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/aulas#agenda"
                className="inline-flex h-12 items-center justify-center bg-vermelho px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-branco transition-colors hover:bg-vermelho-escuro"
              >
                Marcar uma aula
              </Link>
              <Link
                href="/obras"
                className="inline-flex h-12 items-center justify-center border border-preto/25 px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-preto transition-colors hover:border-preto"
              >
                Ver as obras
              </Link>
            </div>
          </div>
        </div>
      </Container>

      <div className="relative mt-10 aspect-[16/10] w-full overflow-hidden sm:aspect-[16/7]">
        <Image
          src={fotos.hero.src}
          alt={fotos.hero.alt}
          fill
          priority
          quality={90}
          placeholder="blur"
          sizes="100vw"
          className="hero-img object-cover object-center"
        />
      </div>
    </section>
  );
}
