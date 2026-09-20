import Image from "next/image";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";
import { fotos } from "@/lib/fotos";

export function Sobre() {
  return (
    <section id="sobre" className="bg-papel py-20 sm:py-28 lg:py-32">
      <Container className="grid items-center gap-10 lg:grid-cols-[0.82fr_1fr] lg:gap-16">
        <Reveal className="relative order-2 aspect-[4/5] w-full overflow-hidden rounded-none lg:order-1" tipo="foto">
          <Image
            src={fotos.sobre.src}
            alt={fotos.sobre.alt}
            fill
            placeholder="blur"
            quality={90}
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
        </Reveal>

        <div className="order-1 flex flex-col items-start gap-6 lg:order-2">
          <Eyebrow>Sobre o curso</Eyebrow>
          <Reveal tipo="titulo">
            <h2 className="titulo-secao font-display font-normal tracking-[-0.01em] text-preto">
              A cerâmica como uma{" "}
              <em className="italic text-vermelho">linguagem de criação</em>.
            </h2>
          </Reveal>
          <Reveal className="flex flex-col gap-5 text-[1.05rem] leading-relaxed text-grafite/85">
            <p>
              As aulas são um convite para conhecer a cerâmica como uma linguagem
              de criação. Você aprende os fundamentos técnicos enquanto desenvolve
              projetos próprios, explorando formas, texturas e possibilidades do
              barro.
            </p>
            <p>
              Cada aluno constrói seu próprio processo, de acordo com seus
              interesses, com acompanhamento individual e referências que ampliam
              seu repertório artístico.
            </p>
          </Reveal>
          <Reveal>
            <p className="flex items-center gap-3 font-display text-xl italic text-preto">
              <span aria-hidden className="h-px w-8 bg-verde" />
              Não é necessário ter experiência prévia.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
