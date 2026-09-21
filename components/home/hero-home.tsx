import Image from "next/image";
import { Container } from "@/components/section";
import { ARTISTA, SITE } from "@/lib/constants";
import { OBRAS } from "@/lib/obras";

/**
 * A ABERTURA DA PÁGINA INICIAL.
 *
 * ── "O mínimo de texto nesse momento" ─────────────────────────────────────
 * Palavras da Isabela. A abertura anterior tinha rótulo, um cartaz de três
 * linhas, um parágrafo de apoio, dois botões e uma ficha de obra — e logo
 * abaixo vinham as portas. Era muita coisa antes do primeiro clique.
 *
 * Aqui sobrou o necessário para alguém saber onde está: o NOME, o que ela é,
 * e uma peça. Nenhum botão: os botões são as três portas logo abaixo, e a
 * barra já carrega o caminho de agendar em toda tela.
 *
 * ── E por que o nome, e não a frase ───────────────────────────────────────
 * "O barro guarda o gesto" era o cartaz desta página. A frase continua ótima
 * e não serve mais AQUI: ela fala de cerâmica, e a cerâmica virou um dos três
 * setores. Ela mudou de endereço e agora abre `/ceramica`, que é onde ela é
 * verdade inteira. Quem manda na home é o nome — foi o que a Isabela pediu ao
 * dizer que "o site pode ser meu nome, pq bela cerâmica é um dos setores".
 */
export function HeroHome() {
  const capa = OBRAS.find((o) => o.id === "flores-de-luto-2026")!;

  return (
    <section className="bg-papel pt-[6.5rem] pb-12 sm:pt-[8rem] sm:pb-16">
      <Container className="grid items-end gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
        <div data-enter className="flex flex-col items-start gap-5">
          <p className="rotulo">{SITE.cidade}</p>

          <h1 className="cartaz font-display text-preto">
            Isabela
            <br />
            <em className="italic text-vermelho">Molinari</em>
          </h1>

          <p className="versalete-larga text-[0.66rem] text-preto/55">
            {ARTISTA.titulo}
          </p>
        </div>

        <figure className="flex flex-col lg:mb-2">
          <div className="sobreimpressao w-full">
            <div className="fuga relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={capa.foto}
                alt={capa.alt}
                fill
                priority
                placeholder="blur"
                quality={92}
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="hero-img object-cover object-center"
              />
            </div>
          </div>

          <figcaption className="ficha-parede mt-4 text-preto/55">
            <em className="text-preto">{capa.titulo}</em>, {capa.ano} · Série
            Flores de Luto
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
