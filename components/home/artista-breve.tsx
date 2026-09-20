import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";
import { fotos } from "@/lib/fotos";
import { ARTISTA } from "@/lib/constants";

/**
 * "Conheça Isabela Molinari", com as duas entradas que ela pediu: trajetória
 * artística e exposições.
 *
 * AS EXPOSIÇÕES AINDA NÃO ESTÃO AQUI. Enquanto a lista real não existir, o
 * card leva para `/sobre` em vez de exibir uma linha inventada — mesma regra
 * que `lib/obras.ts` já segue para as peças. Currículo de artista com
 * exposição que não aconteceu é o tipo de erro que custa reputação, e quem
 * conferisse não encontraria nada.
 */
export function ArtistaBreve() {
  return (
    <section className="bg-branco py-16 sm:py-20 lg:py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            <Image
              src={fotos.isabela.src}
              alt={fotos.isabela.alt}
              fill
              placeholder="blur"
              quality={88}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <div className="flex flex-col gap-5">
          <Eyebrow>Conheça</Eyebrow>
          <h2 className="titulo-secao versalete font-display text-vermelho">
            Isabela Molinari
          </h2>
          <p className="versalete-larga text-[0.65rem] text-preto/55">
            {ARTISTA.titulo}
          </p>

          <p className="text-[1.02rem] leading-relaxed text-grafite">
            {ARTISTA.formacao}. Conduz turmas de cerâmica há{" "}
            {ARTISTA.anosEnsinando} anos e trabalha o barro como linguagem — na
            peça utilitária e na escultórica, em séries pequenas.
          </p>

          <div className="mt-2 grid gap-px border border-linha bg-linha sm:grid-cols-2">
            <Link
              href="/sobre"
              className="group flex flex-col gap-1 bg-branco p-5 transition-colors hover:bg-papel"
            >
              <span className="versalete font-display text-lg text-preto group-hover:text-vermelho">
                Trajetória
              </span>
              <span className="text-[0.85rem] leading-relaxed text-grafite/75">
                Formação, prática e o que guia o trabalho.
              </span>
            </Link>
            <Link
              href="/sobre#exposicoes"
              className="group flex flex-col gap-1 bg-branco p-5 transition-colors hover:bg-papel"
            >
              <span className="versalete font-display text-lg text-preto group-hover:text-vermelho">
                Exposições
              </span>
              <span className="text-[0.85rem] leading-relaxed text-grafite/75">
                Onde o trabalho já foi mostrado.
              </span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
