import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { FotoDaSecao } from "@/components/foto-da-secao";
import { Container } from "@/components/section";
import { CarrosselPortas } from "@/components/home/carrossel-portas";
import { RodaZodiacal } from "@/components/home/roda-zodiacal";
import { OBRAS } from "@/lib/obras";
import { WHATSAPP_ATENDIMENTO } from "@/lib/constants";
import { vitrineDasAulas } from "@/lib/vitrine";
import { cn } from "@/lib/utils";

/**
 * AS TRÊS PORTAS DA PÁGINA INICIAL.
 *
 * Continuam sendo os três setores que a Isabela ditou — Bela Cerâmica, a
 * artista e a astrologia —, mas deixaram de ser cartões para LER. Agora cada
 * porta é uma chamada para AGIR, e quem chega entende o que está à venda
 * sem ler uma frase:
 *
 *   Cerâmica   → a próxima aula AO VIVO (data, hora, lugares na mesa) e os
 *                dois preços lado a lado, com a mensal por aula ao lado da
 *                avulsa. "R$ 200/aula" contra "R$ 250" é o argumento inteiro.
 *   Artista    → as obras se revezando na própria porta.
 *   Astrologia → o céu girando e o botão que marca a leitura no WhatsApp.
 *
 * ── O cartão inteiro é clicável ───────────────────────────────────────────
 * O CTA principal estica um `::after` sobre o cartão todo: tocar em qualquer
 * lugar da foto leva à ação principal. Os atalhos secundários (preço da
 * mensal, "ver obras") ficam por cima, em `z-10`, e levam a lugares mais
 * específicos. Não há link dentro de link — é o jeito válido de fazer isso.
 *
 * ── Tudo acima da dobra ───────────────────────────────────────────────────
 * No desktop as três cabem inteiras na primeira tela, abaixo do nome. No
 * celular viram um carrossel com a ponta do próximo à vista, cerâmica
 * primeiro: é o que se compra sozinho, e o que paga o ateliê.
 */
export async function Portas() {
  const { avulsa, mensal, proximaAula } = await vitrineDasAulas();

  const obras = ["flores-processo-espiral", "esc-2023-espiral"]
    .map((id) => OBRAS.find((o) => o.id === id))
    .filter((o) => o !== undefined);

  const destinoAula = `/aulas?origem=home-ceramica#agenda`;

  return (
    <section className="creme pb-12 sm:pb-16">
      <Container className="max-sm:px-0">
        <CarrosselPortas>
          {/* ── 01 · Bela Cerâmica ─────────────────────────────────────── */}
          <Porta i={0} chaveFoto="home.porta.ceramica" tingido="bg-osso/40" rotulo="Bela Cerâmica · aulas">
            {proximaAula ? (
              // A próxima aula, ao vivo. Toque aqui = pagamento DAQUELA data.
              <Link
                href={`/aulas?horario=${proximaAula.id}&origem=home-proxima#agenda`}
                className="relative z-10 flex w-fit items-center gap-2.5 bg-preto/55 px-3 py-2 text-papel backdrop-blur-sm transition-colors hover:bg-preto/75"
              >
                <span aria-hidden className="ponto-vivo h-2 w-2 shrink-0 rounded-full bg-verde-claro" />
                <span className="text-[0.78rem] font-medium">
                  {proximaAula.dia} {proximaAula.data} · {proximaAula.hora}
                </span>
                <Lugares vagas={proximaAula.vagas} restantes={proximaAula.restantes} />
                <span className="sr-only">
                  {proximaAula.restantes} lugares livres. Reservar esta aula.
                </span>
              </Link>
            ) : null}

            <h2 className="mt-auto font-display text-[clamp(1.9rem,3vw,2.5rem)] leading-[1] text-papel">
              Aulas de cerâmica
            </h2>

            <div className="relative z-10 flex flex-wrap gap-2">
              {mensal ? (
                <Link
                  href="/aulas?plano=mensal&origem=home-mensal#agenda"
                  className="flex items-baseline gap-1.5 bg-vermelho px-3 py-1.5 text-branco transition-colors hover:bg-vermelho-escuro"
                >
                  <span className="numeral text-[1.15rem] leading-none">{mensal.porAula}</span>
                  <span className="text-[0.72rem]">/aula mensal</span>
                  <span className="versalete-larga ml-1 text-[0.52rem] text-branco/85">
                    −{mensal.pctEconomia}%
                  </span>
                </Link>
              ) : null}
              {avulsa ? (
                <Link
                  href="/aulas?plano=avulsa&origem=home-avulsa#agenda"
                  className="flex items-baseline gap-1.5 border border-papel/50 px-3 py-1.5 text-papel transition-colors hover:border-papel hover:bg-papel/10"
                >
                  <span className="numeral text-[1.15rem] leading-none">{avulsa.preco}</span>
                  <span className="text-[0.72rem]">avulsa</span>
                </Link>
              ) : null}
            </div>

            <Chamada href={destinoAula}>Marcar minha aula</Chamada>
            <Atalho href="/ceramica">aulas e oficinas</Atalho>
          </Porta>

          {/* ── 02 · A artista ─────────────────────────────────────────── */}
          <Porta
            i={1}
            chaveFoto="home.porta.artista"
            tingido="bg-cinza/20"
            rotulo="A artista"
            sobreFoto={obras.map((o, n) => (
              <Image
                key={o.id}
                src={o.foto}
                alt=""
                fill
                sizes="(max-width: 640px) 84vw, 33vw"
                quality={80}
                className="porta-obra object-cover"
                style={{ animationDelay: `${4 + n * 4}s` }}
              />
            ))}
          >
            <h2 className="mt-auto font-display text-[clamp(1.9rem,3vw,2.5rem)] leading-[1] text-papel">
              Isabela Molinari
            </h2>
            <p className="versalete-larga text-[0.58rem] text-papel/75">
              Cerâmica · desenho · arteterapia
            </p>

            <Chamada href="/sobre">Conhecer a artista</Chamada>
            <Atalho href="/obras">ver obras</Atalho>
          </Porta>

          {/* ── 03 · Astrologia ────────────────────────────────────────── */}
          <Porta
            i={2}
            chaveFoto="home.porta.astrologia"
            tingido="bg-sanguinea/20"
            rotulo="Astrologia"
            sobreFoto={
              <RodaZodiacal className="pointer-events-none absolute -right-[18%] -top-[12%] w-[85%] text-papel/35" />
            }
          >
            <h2 className="mt-auto font-display text-[clamp(1.9rem,3vw,2.5rem)] leading-[1] text-papel">
              Leitura do seu céu
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {["Mapa natal", "Tarot", "Individual"].map((t) => (
                <span key={t} className="border border-papel/40 px-2 py-1 text-[0.72rem] text-papel/90">
                  {t}
                </span>
              ))}
            </div>

            <Chamada href={WHATSAPP_ATENDIMENTO} externo>
              Agendar leitura
            </Chamada>
            <Atalho href="/atendimentos">como funciona</Atalho>
          </Porta>
        </CarrosselPortas>
      </Container>
    </section>
  );
}

/* ── Peças ──────────────────────────────────────────────────────────────── */

function Porta({
  i,
  chaveFoto,
  tingido,
  rotulo,
  sobreFoto,
  children,
}: {
  i: number;
  chaveFoto: string;
  tingido: string;
  rotulo: string;
  sobreFoto?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article
      style={{ "--i": i } as React.CSSProperties}
      className={cn(
        "porta-entra group relative isolate flex h-[min(74svh,34rem)] w-[84vw] shrink-0 snap-start flex-col overflow-hidden sm:w-auto lg:h-[min(68svh,40rem)]",
        tingido
      )}
    >
      <div className="absolute inset-0 -z-10 transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]">
        <FotoDaSecao
          chave={chaveFoto}
          quality={84}
          priority={i === 0}
          sizes="(max-width: 640px) 84vw, 33vw"
          className="object-cover"
        />
        {sobreFoto}
      </div>
      {/* Escurece o pé da foto para o texto claro ser legível sobre qualquer
          imagem que a Isabela escolher no painel. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-preto/90 via-preto/35 to-preto/10 transition-opacity duration-[var(--t-estado)] group-hover:opacity-95"
      />

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <p className="versalete-larga text-[0.56rem] text-papel/80">
          <span className="indice mr-2 text-papel/55">{String(i + 1).padStart(2, "0")}</span>
          {rotulo}
        </p>
        {children}
      </div>
    </article>
  );
}

/**
 * O CTA principal. O `::after` cobre o cartão inteiro, então tocar em
 * qualquer parte da porta leva aqui.
 */
function Chamada({
  href,
  externo = false,
  children,
}: {
  href: string;
  externo?: boolean;
  children: React.ReactNode;
}) {
  const classes =
    "mt-1 flex h-[3.1rem] items-center justify-between gap-3 bg-papel px-5 text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-preto transition-[background-color,color] duration-[var(--t-toque)] ease-[var(--ease-firme)] after:absolute after:inset-0 after:content-[''] group-hover:bg-branco group-hover:text-vermelho";
  const seta = externo ? (
    <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform duration-[var(--t-estado)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
  ) : (
    <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-[var(--t-estado)] group-hover:translate-x-1" />
  );

  return externo ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {children}
      {seta}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {children}
      {seta}
    </Link>
  );
}

function Atalho({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative z-10 -mt-1 self-center text-[0.72rem] text-papel/70 underline decoration-papel/30 underline-offset-4 transition-colors hover:text-papel hover:decoration-papel"
    >
      {children}
    </Link>
  );
}

/** Um ponto por lugar da mesa: vazado = livre. A escassez sem palavra. */
function Lugares({ vagas, restantes }: { vagas: number; restantes: number }) {
  const ocupados = Math.max(vagas - restantes, 0);
  return (
    <span aria-hidden className="flex gap-[3px]">
      {Array.from({ length: Math.min(vagas, 8) }, (_, n) => (
        <span
          key={n}
          className={
            n < ocupados
              ? "h-[7px] w-[7px] rounded-full bg-papel/45"
              : "h-[7px] w-[7px] rounded-full border border-papel"
          }
        />
      ))}
    </span>
  );
}
