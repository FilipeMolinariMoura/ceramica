import Link from "next/link";
import { HeroHome } from "@/components/home/hero-home";
import { Portas } from "@/components/home/portas";
import { ProximosHorarios } from "@/components/home/proximos-horarios";
import { Pesquisa } from "@/components/home/pesquisa";
import { ArtistaBreve } from "@/components/home/artista-breve";
import { PrintsEmBreve } from "@/components/home/prints-em-breve";
import { ConviteFinal } from "@/components/home/convite-final";
import { FaixaObra } from "@/components/arte/faixa-obra";
import { GaleriaAtelie } from "@/components/galeria-atelie";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { TRAJETORIA } from "@/lib/trajetoria";
import { FECHAMENTO } from "@/lib/constants";

// O hero, as portas e os próximos horários leem o banco. Sem isto o Next
// tentaria prerenderizar a home no `docker build`, onde não há Postgres.
export const dynamic = "force-dynamic";

/**
 * A HOME.
 *
 * ── O arco, e por que ele mudou de novo ───────────────────────────────────
 * A primeira versão desta página vendia sem dizer quem ela é. A segunda
 * corrigiu isso — obra, pesquisa, currículo — e errou para o outro lado: o
 * bloco de arte ficou grande e cedo, e as três seções seguintes terminavam
 * em links laterais (o acervo, a trajetória, o Instagram). Dava para percorrer
 * a página inteira admirando o trabalho e nunca esbarrar num caminho de compra.
 *
 * A ordem agora é:
 *
 *   1. o cartaz, com o preço e o botão      ← vende
 *   2. as três portas, com preço            ← vende
 *   3. os próximos horários REAIS           ← fecha
 *   4. a pesquisa                           ← prova, e sai vendendo
 *   5. a queima em Igatu                    ← prova
 *   6. o currículo                          ← prova, e sai vendendo
 *   7. o ateliê                             ← prova, e sai vendendo
 *   8. prints · 9. convite
 *
 * A arte não saiu e não encolheu de importância: ela é o que sustenta R$ 250
 * a aula contra o ateliê que cobra menos. O que mudou é que ela deixou de ser
 * um destino e virou o argumento — toda seção de prova termina apontando para
 * `FECHAMENTO`, que é o único lugar do site onde alguém compra sozinho.
 *
 * A ordem das três portas é a que a Isabela pediu, e essa não muda.
 */
export default function Home() {
  const igatu = TRAJETORIA.find((e) => e.id === "xique-xique")!;

  return (
    <>
      <HeroHome />
      <Portas />
      <ProximosHorarios />
      <Pesquisa />

      <FaixaObra
        foto={igatu.foto!}
        alt={igatu.alt!}
        legenda={`Queima a céu aberto · ${igatu.titulo}, ${igatu.cidade}, ${igatu.ano}`}
      />

      <ArtistaBreve />

      <section className="creme py-16 sm:py-20">
        <Container className="mb-8 flex flex-col gap-3">
          <p className="rotulo">O ateliê</p>
          <Reveal tipo="titulo">
            <h2 className="titulo-secao versalete max-w-lg font-display text-realce">
              Onde a aula acontece
            </h2>
          </Reveal>
        </Container>
        <Container>
          <GaleriaAtelie variante="faixa" />
        </Container>
        <Container className="mt-8">
          <Link
            href={FECHAMENTO}
            className="inline-flex h-[3.1rem] items-center justify-center bg-vermelho px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-branco transition-[background-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:bg-vermelho-escuro active:translate-y-px"
          >
            Marcar uma aula nesta mesa
          </Link>
        </Container>
      </section>

      <PrintsEmBreve />
      <ConviteFinal />
    </>
  );
}
