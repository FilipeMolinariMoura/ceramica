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
    <section className="bg-cobalto py-20 text-lona-100 sm:py-24">
      <Container className="flex flex-col items-start gap-7">
        <Eyebrow tone="lona">Turmas abertas</Eyebrow>
        <Reveal>
          <h2 className="max-w-2xl font-display text-3xl font-light leading-[1.12] tracking-[-0.01em] sm:text-4xl lg:text-[2.9rem]">
            Seis pessoas por turma, às terças, em{" "}
            <em className="italic text-parede-soft">{SITE.bairro}</em>.
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="max-w-xl text-[1.05rem] leading-relaxed text-lona/85">
            Turma pequena é decisão de projeto: dá para acompanhar cada pessoa
            individualmente. Não é preciso ter experiência com barro.
          </p>
        </Reveal>
        <Reveal delay={140} className="flex flex-wrap items-center gap-3">
          <Link
            href="/aulas"
            className="inline-flex h-[3.35rem] items-center justify-center rounded-full bg-lona-100 px-8 text-base font-medium tracking-tight text-barro transition-[background-color,transform] duration-200 hover:bg-white active:scale-[0.98]"
          >
            Ver as turmas
          </Link>
          <a
            href={WHATSAPP_DUVIDA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[3.35rem] items-center justify-center rounded-full border border-lona/40 px-8 text-base font-medium tracking-tight text-lona transition-colors duration-200 hover:border-lona hover:bg-lona hover:text-cobalto"
          >
            Falar no WhatsApp
          </a>
        </Reveal>
      </Container>
    </section>
  );
}
