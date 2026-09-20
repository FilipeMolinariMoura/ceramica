import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { fotos } from "@/lib/fotos";
import { WHATSAPP_ATENDIMENTO } from "@/lib/constants";

const description =
  "Atendimento individual de tarot e astrologia com Isabela Molinari, artista visual e arteterapeuta, em Pinheiros ou on-line.";

export const metadata: Metadata = {
  title: "Atendimentos",
  description,
  alternates: { canonical: "/atendimentos" },
  openGraph: {
    title: "Atendimento 1:1 · Tarot e Astrologia",
    description,
    url: "/atendimentos",
  },
};

/**
 * A terceira porta.
 *
 * Ainda NÃO entra na agenda paga — a Isabela ainda não definiu preço e
 * duração, e publicar um valor inventado seria pior que não publicar nenhum.
 * Quando ela definir, esta página ganha o mesmo seletor de horário de
 * `/aulas`: o motor (`lib/reservas.ts`) já aceita qualquer serviço, basta
 * cadastrar um novo em `servicos`.
 */
const SESSOES = [
  {
    nome: "Tarot",
    texto:
      "Uma leitura para olhar de frente a pergunta que você já está fazendo. Não é previsão: é o que está em jogo agora.",
  },
  {
    nome: "Astrologia",
    texto:
      "Leitura do mapa natal, ou do momento que você está atravessando. Feita com calma, sem jargão.",
  },
] as const;

export default function Atendimentos() {
  return (
    <>
      <PageHero
        eyebrow="Atendimento 1:1"
        titulo="Tarot e"
        destaque="astrologia"
        texto="Sessão individual, no ateliê em Pinheiros ou por chamada de vídeo. Conduzida pela Isabela, que é arteterapeuta antes de qualquer outra coisa."
      />

      <section className="bg-papel pb-16">
        <Container>
          <Reveal>
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src={fotos.quebra.src}
                alt={fotos.quebra.alt}
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
        <Container className="grid gap-px border border-linha bg-linha sm:grid-cols-2">
          {SESSOES.map((s) => (
            <div key={s.nome} className="flex flex-col gap-3 bg-branco p-7 sm:p-9">
              <Eyebrow>{s.nome}</Eyebrow>
              <p className="text-[1rem] leading-relaxed text-grafite">{s.texto}</p>
            </div>
          ))}
        </Container>
      </section>

      <section className="bg-verde py-16 sm:py-20">
        <Container className="flex max-w-2xl flex-col items-start gap-5">
          <Eyebrow tone="claro">Como marcar</Eyebrow>
          <h2 className="titulo-secao versalete font-display text-branco">
            Pelo WhatsApp, direto com a Isabela
          </h2>
          <p className="text-[1rem] leading-relaxed text-branco/85">
            O formato e o valor variam com o que você procura, então esta é a
            única porta do site em que a conversa vem antes. Mande uma mensagem
            dizendo o que te trouxe e ela responde com os horários.
          </p>
          <a
            href={WHATSAPP_ATENDIMENTO}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex h-12 items-center justify-center bg-branco px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-vermelho transition-[background-color,color,border-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] active:translate-y-px hover:bg-papel"
          >
            Chamar no WhatsApp
          </a>
        </Container>
      </section>
    </>
  );
}
