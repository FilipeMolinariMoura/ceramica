import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { fotos } from "@/lib/fotos";
import { cn } from "@/lib/utils";

/**
 * As três portas do site, no formato que as referências usam: foto grande,
 * nome da seção e seta.
 *
 * A grade é assimétrica de propósito: aulas (o que tem vaga aberta) ocupa
 * duas colunas na primeira linha, obras fecha a linha, e encomendas atravessa
 * a segunda como faixa. Três cards iguais dariam o mesmo peso a três coisas
 * que não têm o mesmo peso — e deixariam um card sozinho numa linha de três.
 */
const PORTAS = [
  {
    href: "/aulas",
    titulo: "Aulas de cerâmica",
    texto: "Duas turmas às terças, seis pessoas cada, acompanhamento individual.",
    foto: fotos.isabela,
    span: "sm:col-span-2",
    altura: "min-h-[20rem] sm:min-h-[26rem]",
  },
  {
    href: "/obras",
    titulo: "Obras",
    texto: "Peças autorais saídas do ateliê.",
    foto: fotos.quebra,
    span: "",
    altura: "min-h-[20rem] sm:min-h-[26rem]",
  },
  {
    href: "/encomendas",
    titulo: "Encomendas",
    texto: "Uma peça pensada para o seu espaço.",
    foto: fotos.sobre,
    span: "sm:col-span-2 lg:col-span-3",
    altura: "min-h-[17rem]",
  },
] as const;

export function Portas() {
  return (
    <section className="bg-lona py-20 sm:py-24 lg:py-28">
      <Container className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PORTAS.map((porta, i) => (
          <Reveal
            key={porta.href}
            delay={i * 90}
            className={porta.span}
          >
            <Link
              href={porta.href}
              className={cn(
                "group relative flex h-full flex-col justify-end overflow-hidden rounded-lg p-7",
                porta.altura
              )}
            >
              <Image
                src={porta.foto.src}
                alt={porta.foto.alt}
                fill
                placeholder="blur"
                quality={88}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-barro/80 via-barro/25 to-transparent transition-opacity duration-500 group-hover:from-barro/85" />

              <div className="relative flex flex-col gap-2">
                <h2 className="flex items-center gap-2.5 font-display text-2xl text-lona sm:text-[1.7rem]">
                  {porta.titulo}
                  <ArrowRight
                    aria-hidden
                    className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </h2>
                <p className="max-w-sm text-[0.98rem] leading-relaxed text-lona/80">
                  {porta.texto}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}
