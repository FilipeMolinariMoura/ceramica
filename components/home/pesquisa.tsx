import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Rasgo } from "@/components/arte/rasgo";
import { OBRAS, ficha } from "@/lib/obras";
import { CITACAO, PESQUISA } from "@/lib/trajetoria";

/**
 * A PESQUISA — a seção que o site não tinha e que era o buraco inteiro.
 *
 * Um site de artista que não mostra a obra nem diz o que ela investiga é um
 * site de serviço com o nome de uma artista em cima. Era o caso aqui: havia
 * aula, oficina, atendimento e preço, e nenhuma linha sobre o que a Isabela
 * faz quando não está dando aula. Ela tem exposição individual apoiada pela
 * Funarte, uma residência na Chapada e uma série em curso sobre luto.
 *
 * ── Por que preta ─────────────────────────────────────────────────────────
 * Os desenhos dela são sanguínea sobre papel cru. Sobre creme eles quase
 * encostam no fundo do site e perdem meio tom de contraste; sobre preto, o
 * papel vira luz e cada folha se lê como uma folha recortada. É o mesmo
 * motivo de uma galeria pintar a parede — só que aqui o escuro também faz o
 * corte de ritmo entre a parte que vende e a parte que é trabalho.
 *
 * ── E por que a obra não é tratada ────────────────────────────────────────
 * `object-contain` e nada mais: sem filtro, sem trama, sem tingido por cima.
 * O site inteiro ganhou vocabulário de impresso, e a tentação era aplicá-lo
 * também aqui. Seria estragar um desenho para imitar um desenho.
 */
export function Pesquisa() {
  const interdito = OBRAS.find((o) => o.id === "do-interdito-ao-ceu")!;
  const naturezaViva = OBRAS.find((o) => o.id === "natureza-viva-lona")!;

  return (
    <section className="escuro relative overflow-hidden pt-20 pb-20 sm:pt-24 sm:pb-24">
      <Rasgo cor="var(--color-papel)" />

      <Container className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <div className="flex flex-col gap-6">
          <p className="rotulo">A pesquisa</p>

          <Reveal tipo="titulo">
            <h2 className="titulo-secao max-w-md font-display text-papel">
              O corpo, o símbolo e{" "}
              <em className="italic text-osso">o inconsciente</em>
            </h2>
          </Reveal>

          {PESQUISA.map((paragrafo, i) => (
            <Reveal key={i} tipo="texto" indice={i}>
              <p className="max-w-md text-[1rem] leading-relaxed text-papel/70">
                {paragrafo}
              </p>
            </Reveal>
          ))}

          <Reveal className="mt-2">
            <Link
              href="/obras"
              className="inline-flex h-[3.1rem] items-center justify-center border border-papel/35 px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-papel transition-[background-color,color,border-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:border-papel hover:bg-papel hover:text-preto active:translate-y-px"
            >
              Ver o acervo
            </Link>
          </Reveal>
        </div>

        {/* As duas folhas. A segunda desce e recua — duas imagens do mesmo
            tamanho, alinhadas, viram uma grade; desencontradas, viram pilha
            de papel sobre a mesa, que é o assunto. */}
        <div className="flex flex-col gap-10 sm:gap-12">
          <Reveal tipo="foto">
            <figure>
              <div className="relative aspect-[5/4] w-full">
                <Image
                  src={interdito.foto}
                  alt={interdito.alt}
                  fill
                  placeholder="blur"
                  quality={90}
                  sizes="(max-width: 1024px) 92vw, 52vw"
                  className="object-contain"
                />
              </div>
              <figcaption className="ficha-parede mt-4 text-papel/50">
                <em className="text-papel/85">{interdito.titulo}</em>,{" "}
                {interdito.ano}
                <br />
                {ficha(interdito)}
              </figcaption>
            </figure>
          </Reveal>

          <Reveal tipo="foto" indice={1} className="sm:pl-[14%]">
            <figure>
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={naturezaViva.foto}
                  alt={naturezaViva.alt}
                  fill
                  placeholder="blur"
                  quality={90}
                  sizes="(max-width: 1024px) 80vw, 45vw"
                  className="object-contain"
                />
              </div>
              <figcaption className="ficha-parede mt-4 text-papel/50">
                <em className="text-papel/85">{naturezaViva.titulo}</em>,{" "}
                {naturezaViva.ano}
                <br />
                {ficha(naturezaViva)}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Container>

      {/* A frase dela, uma vez só e grande. É a única citação do site: usada
          duas vezes ela viraria assinatura de rodapé. */}
      <Container className="mt-16 sm:mt-20">
        <Reveal tipo="titulo">
          <blockquote className="max-w-4xl border-t border-papel/20 pt-8">
            <p className="font-display text-[1.5rem] leading-[1.28] text-papel/90 italic sm:text-[2rem]">
              “{CITACAO.texto}”
            </p>
            <footer className="rotulo mt-5 text-papel/45">
              {CITACAO.fonte}
            </footer>
          </blockquote>
        </Reveal>
      </Container>
    </section>
  );
}
