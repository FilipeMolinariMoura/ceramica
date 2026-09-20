import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Rasgo } from "@/components/arte/rasgo";
import { OBRAS, ficha } from "@/lib/obras";
import { WHATSAPP_ATENDIMENTO } from "@/lib/constants";

const description =
  "Atendimento individual de tarot e astrologia com Isabela Molinari, artista visual e arteterapeuta, em Pinheiros ou por chamada de vídeo.";

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
 * ── O problema de posicionamento ──────────────────────────────────────────
 * Esta era a página mais frágil do site, porque parecia um puxadinho: uma
 * ceramista que também lê tarot. Dito assim, desvaloriza as duas coisas.
 *
 * Mas o portfólio dela diz outra coisa. A pesquisa da Isabela é sobre "o
 * corpo, o simbólico e o inconsciente"; a exposição individual parte do
 * Bataille e da relação entre interdito e transgressão; a série em curso é
 * sobre ciclo de vida e morte, "campo ritual e da passagem". E ela está
 * cursando pós em Arteterapia.
 *
 * Tarot e astrologia não são um segundo negócio: são o mesmo território —
 * símbolo, leitura, o que não se explica e se atravessa. A página passa a
 * dizer isso, e é o que justifica sentar com ela em vez de com qualquer
 * pessoa que tire carta.
 *
 * ── A imagem ──────────────────────────────────────────────────────────────
 * Nenhuma foto de baralho, nenhum mapa astral de banco de imagens. A peça de
 * 2023 com o cilindro vermelho entre duas formas sinuosas é da obra dela e
 * diz "símbolo" sem precisar de legenda. Usar um tarô genérico aqui seria
 * exatamente o gesto que faz o site inteiro parecer comprado pronto.
 *
 * Continua fora da agenda paga: ela ainda não definiu preço nem duração, e
 * publicar um valor inventado é pior do que não publicar nenhum. Quando
 * definir, `lib/reservas.ts` já aceita qualquer serviço — basta cadastrar
 * um novo em `servicos` e esta página ganha o mesmo seletor de `/aulas`.
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
  const peca = OBRAS.find((o) => o.id === "esc-2023-serpente")!;

  return (
    <>
      <section className="bg-papel pt-[6.5rem] pb-14 sm:pt-[8rem] sm:pb-16">
        <Container className="grid items-end gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div data-enter className="flex flex-col items-start gap-6">
            <p className="rotulo">Atendimento 1:1</p>
            <h1 className="cartaz font-display text-preto">
              Tarot e
              <br />
              <em className="italic text-vermelho">astrologia</em>
            </h1>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-grafite">
              Sessão individual, no ateliê em Pinheiros ou por chamada de
              vídeo. Conduzida pela Isabela — que é arteterapeuta, e cuja
              pesquisa em arte é sobre exatamente isto.
            </p>
          </div>

          <figure className="flex flex-col lg:mb-2">
            <div className="sobreimpressao w-full">
              <div className="fuga relative aspect-[4/5] w-full overflow-hidden bg-papel">
                <Image
                  src={peca.foto}
                  alt={peca.alt}
                  fill
                  priority
                  placeholder="blur"
                  quality={90}
                  sizes="(max-width: 1024px) 92vw, 44vw"
                  className="object-cover"
                />
              </div>
            </div>
            <figcaption className="ficha-parede mt-4 text-preto/55">
              <em className="text-preto">{peca.titulo}</em>, {peca.ano}
              <br />
              {ficha(peca)}
            </figcaption>
          </figure>
        </Container>
      </section>

      {/* A ponte entre a obra e a sessão. É a seção que faz esta página deixar
          de parecer um serviço solto. */}
      <section className="escuro relative py-16 sm:py-20">
        <Rasgo cor="var(--color-papel)" />
        <Container className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <p className="rotulo">Por que com ela</p>
            <Reveal tipo="titulo">
              <h2 className="titulo-secao max-w-md font-display text-papel">
                O mesmo <em className="italic text-osso">território</em>
              </h2>
            </Reveal>
            <p className="max-w-md text-[1rem] leading-relaxed text-papel/70">
              A pesquisa da Isabela em arte é sobre o corpo, o símbolo e o
              inconsciente. A individual dela partiu da relação entre interdito
              e transgressão; a série que ela faz agora é sobre o ciclo de vida
              e morte, e sobre passagem.
            </p>
            <p className="max-w-md text-[1rem] leading-relaxed text-papel/70">
              Carta e mapa são a mesma matéria: imagem que se lê. Não é um
              segundo ofício ao lado da cerâmica — é a mesma escuta, com outro
              instrumento.
            </p>
          </div>

          <div className="grid gap-px self-start border border-papel/20 bg-papel/20 sm:grid-cols-2">
            {SESSOES.map((s, i) => (
              <Reveal key={s.nome} indice={i} tipo="cartao">
                <div className="flex h-full flex-col gap-3 bg-superficie p-7 sm:p-8">
                  <span aria-hidden className="indice text-osso">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="titulo-cartao font-display text-papel">
                    {s.nome}
                  </h3>
                  <p className="text-[0.95rem] leading-relaxed text-papel/70">
                    {s.texto}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-papel py-16 sm:py-20">
        <Container className="flex max-w-2xl flex-col items-start gap-5">
          <p className="rotulo">Como marcar</p>
          <Reveal tipo="titulo">
            <h2 className="titulo-secao font-display text-preto">
              Pelo WhatsApp,{" "}
              <em className="italic text-vermelho">direto com ela</em>
            </h2>
          </Reveal>
          <p className="max-w-xl text-[1.02rem] leading-relaxed text-cinza">
            O formato e o valor variam com o que você procura, então esta é a
            única porta do site em que a conversa vem antes. Mande uma mensagem
            dizendo o que te trouxe e ela responde com os horários.
          </p>
          <a
            href={WHATSAPP_ATENDIMENTO}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex h-[3.1rem] items-center justify-center bg-vermelho px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-branco transition-[background-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:bg-vermelho-escuro active:translate-y-px"
          >
            Chamar no WhatsApp
          </a>
        </Container>
      </section>
    </>
  );
}
