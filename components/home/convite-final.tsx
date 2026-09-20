import Link from "next/link";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";
import { Malha } from "@/components/fundo/malha";
import { SITE, WHATSAPP_DUVIDA } from "@/lib/constants";

/**
 * Fecho da home, sobre o campo animado.
 *
 * O shader mora AQUI, e só aqui, por três razões:
 *
 *   é o pé da página, então na maior parte da visita ele está fora da tela e
 *   o IntersectionObserver o mantém parado;
 *
 *   não há foto nem texto longo competindo — é uma frase, dois botões e
 *   espaço, que é exatamente onde atmosfera acrescenta em vez de atrapalhar;
 *
 *   e o fundo continua sendo uma cor sólida por baixo. Se o WebGL não existir
 *   no aparelho, ou se a pessoa pediu menos movimento, o que sobra é a seção
 *   preta que já estava desenhada — nunca um buraco.
 *
 * A camada de escurecimento entre o shader e o texto não é enfeite: o campo
 * passa por tons claros quando uma bolha verde atravessa, e sem ela o
 * contraste do texto oscilaria durante a animação. WCAG vale em todo quadro,
 * não só no primeiro.
 */
export function ConviteFinal() {
  return (
    <section className="escuro relative isolate overflow-hidden py-20 sm:py-24">
      <Malha className="absolute inset-0 -z-10 h-full w-full" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-preto/55" />

      <Container className="flex flex-col items-start gap-7">
        <Eyebrow tone="claro">Turmas abertas</Eyebrow>
        <Reveal tipo="titulo">
          <h2 className="titulo-secao versalete max-w-2xl font-display text-papel">
            Seis pessoas por turma,
            <br />
            às terças, em {SITE.bairro}
          </h2>
        </Reveal>
        <Reveal tipo="faixa">
          <p className="max-w-xl text-[1.05rem] leading-relaxed text-papel/85">
            Turma pequena é decisão de projeto: dá para acompanhar cada pessoa
            individualmente. Não é preciso ter experiência com barro.
          </p>
        </Reveal>
        <Reveal className="flex flex-wrap items-center gap-3">
          <Link
            href="/aulas#agenda"
            className="inline-flex h-[3.1rem] items-center justify-center bg-vermelho px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-branco transition-[background-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:bg-vermelho-escuro active:translate-y-px"
          >
            Ver os horários
          </Link>
          <a
            href={WHATSAPP_DUVIDA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[3.1rem] items-center justify-center border border-papel/40 px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-papel transition-[background-color,color,border-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:border-papel hover:bg-papel hover:text-preto active:translate-y-px"
          >
            Falar no WhatsApp
          </a>
        </Reveal>
      </Container>
    </section>
  );
}
