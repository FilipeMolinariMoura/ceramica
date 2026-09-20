import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";
import { fotos } from "@/lib/fotos";
import { reais, servicoPorSlug } from "@/lib/agenda";
import { SERVICO_AULA_AVULSA } from "@/lib/constants";

/**
 * O catálogo: três portas, na ordem que a Isabela pediu.
 *
 * Três cards do MESMO tamanho, de propósito — é um catálogo, e um card maior
 * diria que uma das três importa mais. A versão anterior tinha grade
 * assimétrica porque a home vendia uma turma só.
 *
 * O preço da aula avulsa aparece aqui, na primeira dobra: é o número que faz
 * a pessoa clicar, e escondê-lo dentro da página seria perder quem só passa
 * os olhos. Ele vem do banco, não do código — a Isabela muda pelo painel.
 */
const PORTAS = [
  {
    href: "/aulas",
    numero: "01",
    titulo: "Turma de aulas",
    texto: "Aula avulsa com horário marcado, ou turma mensal de seis pessoas.",
    foto: fotos.isabela,
    chamada: "Ver a agenda",
  },
  {
    href: "/oficinas",
    numero: "02",
    titulo: "Sua oficina",
    texto: "Aniversário, time, bodas, formatura. A gente monta e leva.",
    foto: fotos.prova,
    chamada: "Pedir orçamento",
  },
  {
    href: "/atendimentos",
    numero: "03",
    titulo: "Atendimento 1:1",
    texto: "Tarot e astrologia, em sessão individual.",
    foto: fotos.quebra,
    chamada: "Saber como funciona",
  },
] as const;

export async function Portas() {
  const servico = await servicoPorSlug(SERVICO_AULA_AVULSA);
  const preco = servico ? reais(servico.precoCentavos) : null;

  return (
    <section className="bg-papel py-16 sm:py-20 lg:py-24">
      <Container className="mb-9">
        <Eyebrow>O que tem aqui</Eyebrow>
      </Container>

      <Container className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PORTAS.map((porta, i) => (
          <Reveal key={porta.href} indice={i} className="h-full" tipo="cartao">
            <Link
              href={porta.href}
              className="group flex h-full flex-col border border-linha bg-branco transition-colors hover:border-vermelho"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={porta.foto.src}
                  alt={porta.foto.alt}
                  fill
                  placeholder="blur"
                  quality={86}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
                <span className="versalete-larga absolute left-0 top-0 bg-vermelho px-2.5 py-1.5 text-[0.6rem] text-branco">
                  {porta.numero}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2.5 p-6">
                <h2 className="titulo-cartao versalete font-display text-vermelho">
                  {porta.titulo}
                </h2>
                <p className="text-[0.95rem] leading-relaxed text-grafite/85">
                  {porta.texto}
                </p>

                {porta.href === "/aulas" && preco ? (
                  <p className="text-[0.95rem] font-semibold text-preto">
                    Avulsa {preco}
                  </p>
                ) : null}

                <span className="versalete-larga mt-auto flex items-center gap-2 pt-3 text-[0.65rem] text-preto/60 transition-colors group-hover:text-vermelho">
                  {porta.chamada}
                  <ArrowRight
                    aria-hidden
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}
