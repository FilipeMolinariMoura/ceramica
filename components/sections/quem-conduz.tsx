import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { fotos } from "@/lib/fotos";
import { ARTISTA } from "@/lib/constants";

/**
 * "Quem conduz", na página que vende.
 *
 * ── O argumento que faltava ───────────────────────────────────────────────
 * Esta seção dizia que ela é bacharela, arteterapeuta e ensina há quatro anos.
 * Tudo verdade — e é o que qualquer professora de cerâmica de São Paulo pode
 * escrever. Quando a aula avulsa custa R$ 250 e o ateliê da esquina cobra
 * bem menos, a pergunta silenciosa de quem está decidindo é "por que ela?".
 *
 * A resposta estava num PDF: exposição individual com apoio da Funarte,
 * residência artística na Chapada Diamantina, mais de oito edições de oficina
 * desde 2022. Nenhuma dessas linhas é enfeite de currículo — cada uma é um
 * terceiro dizendo que o trabalho dela vale alguma coisa, que é exatamente o
 * que uma página de venda não consegue dizer sozinha.
 *
 * ── Por que faixa e não parágrafo ─────────────────────────────────────────
 * Porque dentro de um parágrafo estes três fatos passam despercebidos. A
 * Isabela disse que "ninguém lê nada" — então o que precisa ser lido vira
 * número grande com uma linha embaixo, e o parágrafo fica para quem quiser.
 *
 * A foto continua sendo a dela em aula, e não o retrato: nesta página o que
 * interessa é vê-la ensinando. O retrato está em `/sobre`.
 */
const CREDENCIAIS = [
  {
    fato: "2023",
    linha: "Exposição individual",
    nota: "com apoio da Funarte",
  },
  {
    fato: "2025",
    linha: "Residência artística",
    nota: "Igatu, Chapada Diamantina",
  },
  {
    fato: "+8",
    linha: "Oficinas conduzidas",
    nota: `desde ${ARTISTA.projetoDesde}`,
  },
] as const;

export function QuemConduz() {
  return (
    <section className="bg-branco py-20 sm:py-24 lg:py-28">
      <Container className="grid items-center gap-10 lg:grid-cols-[1fr_0.82fr] lg:gap-16">
        <Reveal
          className="relative order-1 aspect-[5/4] w-full overflow-hidden"
          tipo="foto"
        >
          <Image
            src={fotos.isabela.src}
            alt={fotos.isabela.alt}
            fill
            placeholder="blur"
            quality={90}
            sizes="(max-width: 1024px) 100vw, 48vw"
            className="object-cover"
          />
        </Reveal>

        <div className="order-2 flex flex-col items-start gap-6">
          <p className="rotulo">Quem conduz</p>
          <Reveal tipo="titulo">
            <h2 className="titulo-secao versalete font-display text-vermelho">
              Isabela
              <br />
              Molinari
            </h2>
            <p className="versalete-larga mt-3 text-[0.62rem] text-preto/50">
              {ARTISTA.titulo}
            </p>
          </Reveal>
          <Reveal>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-cinza">
              {ARTISTA.formacao}, com pós-graduação em Arteterapia em curso. Há{" "}
              {ARTISTA.anosEnsinando} anos orienta processos criativos em
              cerâmica, unindo{" "}
              <em className="font-display italic text-preto">técnica</em>,{" "}
              <em className="font-display italic text-preto">experimentação</em>{" "}
              e a construção de repertório artístico.
            </p>
          </Reveal>

          <dl className="grid w-full grid-cols-3 gap-x-4 border-t border-linha pt-5">
            {CREDENCIAIS.map((c, i) => (
              <Reveal key={c.linha} indice={i} tipo="texto">
                <div className="flex flex-col gap-0.5">
                  <dt className="numeral text-[1.5rem] leading-none text-preto">
                    {c.fato}
                  </dt>
                  <dd className="mt-1.5 text-[0.82rem] leading-tight font-medium text-preto/80">
                    {c.linha}
                  </dd>
                  <dd className="text-[0.76rem] leading-tight text-cinza/80">
                    {c.nota}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>

          <Link
            href="/obras"
            className="border-b border-vermelho/30 pb-0.5 text-[0.92rem] text-vermelho transition-colors hover:border-vermelho"
          >
            Ver a obra dela
          </Link>
        </div>
      </Container>
    </section>
  );
}
