import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { FormularioOficina } from "@/components/oficinas/formulario-oficina";
import { fotos } from "@/lib/fotos";

const description =
  "Oficina de cerâmica fechada para aniversário, time, bodas ou formatura, no ateliê em Pinheiros ou no seu endereço. Peça um orçamento.";

export const metadata: Metadata = {
  title: "Oficinas",
  description,
  alternates: { canonical: "/oficinas" },
  openGraph: {
    title: "Oficinas de cerâmica · Isabela Molinari",
    description,
    url: "/oficinas",
  },
};

/** O que a oficina inclui. Fatos, não promessa de marketing. */
const INCLUI = [
  ["Barro e ferramentas", "Para todo mundo, na quantidade da turma."],
  ["Condução da Isabela", "Ela conduz do começo ao fim, com quem nunca encostou em barro."],
  ["Queima e esmalte", "As peças voltam prontas — a queima leva cerca de três semanas."],
  ["No ateliê ou no seu espaço", "Em Pinheiros, ou levamos a oficina até o endereço do evento."],
] as const;

export default function Oficinas() {
  return (
    <>
      <PageHero
        eyebrow="Faça a sua"
        titulo="Uma oficina"
        destaque="só da sua gente"
        texto="Aniversário, presente de casamento, time que quer sair do escritório, despedida. Duas a três horas de mão no barro, conduzidas do começo ao fim. Não precisa ninguém ter experiência."
      />

      <section className="bg-papel pb-16">
        <Container>
          <Reveal>
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src={fotos.prova.src}
                alt={fotos.prova.alt}
                fill
                placeholder="blur"
                quality={88}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-branco py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-5">
            <Eyebrow>O que está incluso</Eyebrow>
            <h2 className="versalete font-display text-[1.9rem] leading-[1.06] text-vermelho sm:text-[2.3rem]">
              Você leva as pessoas.
              <br />O resto é com a gente.
            </h2>
            <p className="text-[0.95rem] leading-relaxed text-grafite/85">
              O valor depende de quantas pessoas, de onde e de quando. Conte no
              formulário e a Isabela responde com o número.
            </p>
          </div>

          <dl className="divide-y divide-linha border-y border-linha">
            {INCLUI.map(([titulo, texto]) => (
              <div key={titulo} className="flex flex-col gap-1 py-5">
                <dt className="versalete font-display text-lg text-preto">{titulo}</dt>
                <dd className="text-[0.95rem] leading-relaxed text-grafite/85">{texto}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section id="orcamento" className="scroll-mt-24 bg-papel py-16 sm:py-20">
        <Container className="max-w-3xl">
          <div className="mb-8 flex flex-col gap-4">
            <Eyebrow>Orçamento</Eyebrow>
            <h2 className="versalete font-display text-[1.9rem] leading-[1.06] text-vermelho sm:text-[2.3rem]">
              Conte o que você quer
            </h2>
          </div>
          <FormularioOficina />
        </Container>
      </section>
    </>
  );
}
