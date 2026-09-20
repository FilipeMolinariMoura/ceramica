import Link from "next/link";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal } from "@/components/reveal";
import { SITE, WHATSAPP_DUVIDA } from "@/lib/constants";

/**
 * Fecho da home. Manda para as aulas — é o que tem vaga, data e preço — e
 * deixa o WhatsApp como segunda porta para quem quer outra coisa.
 */
export function ConviteFinal() {
  return (
    <section className="bg-vermelho py-20 text-branco sm:py-24">
      <Container className="flex flex-col items-start gap-7">
        <Eyebrow tone="claro">Turmas abertas</Eyebrow>
        <Reveal tipo="titulo">
          <h2 className="titulo-secao max-w-2xl font-display font-light tracking-[-0.01em]">
            Seis pessoas por turma, às terças, em{" "}
            <em className="italic text-verde-claro">{SITE.bairro}</em>.
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
            href="/aulas"
            className="inline-flex h-[3.35rem] items-center justify-center rounded-none bg-branco px-8 text-base font-medium tracking-tight text-preto transition-[background-color,transform] duration-200 hover:bg-branco active:scale-[0.98]"
          >
            Ver as turmas
          </Link>
          <a
            href={WHATSAPP_DUVIDA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[3.35rem] items-center justify-center rounded-none border border-papel/40 px-8 text-base font-medium tracking-tight text-papel transition-[background-color,color,border-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] active:translate-y-px duration-200 hover:border-papel hover:bg-papel hover:text-vermelho"
          >
            Falar no WhatsApp
          </a>
        </Reveal>
      </Container>
    </section>
  );
}
