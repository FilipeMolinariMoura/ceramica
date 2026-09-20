import { HeroHome } from "@/components/home/hero-home";
import { Portas } from "@/components/home/portas";
import { Pesquisa } from "@/components/home/pesquisa";
import { ArtistaBreve } from "@/components/home/artista-breve";
import { PrintsEmBreve } from "@/components/home/prints-em-breve";
import { ConviteFinal } from "@/components/home/convite-final";
import { FaixaObra } from "@/components/arte/faixa-obra";
import { GaleriaAtelie } from "@/components/galeria-atelie";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { TRAJETORIA } from "@/lib/trajetoria";

// O hero e as portas leem o preço da aula avulsa no banco. Sem isto o Next
// tentaria prerenderizar a home no `docker build`, onde não há Postgres.
export const dynamic = "force-dynamic";

/**
 * A HOME.
 *
 * ── O arco ────────────────────────────────────────────────────────────────
 * A versão anterior era: nome, três portas, um "conheça a artista" sem
 * currículo, prints, fotos do ateliê, convite. Sete blocos corretos e
 * intercambiáveis — dava para trocar o nome no topo e vender qualquer outra
 * coisa.
 *
 * Agora ela conta uma coisa, nesta ordem:
 *
 *   o que eu faço  (a obra, em cartaz)
 *   o que dá para comprar  (as três portas, com preço)
 *   por que isso vale isso  (a pesquisa, a parte escura)
 *   e não é conversa  (a queima em Igatu, largura total)
 *   quem assina  (o currículo, em índice)
 *   onde acontece  (o ateliê)
 *   vem  (o convite)
 *
 * A parte que vende vem ANTES da parte que é arte, e isso é deliberado: quem
 * chega pelo Instagram precisa do preço na primeira dobra. Mas quem rola
 * descobre que não está comprando aula de cerâmica de bairro — e essa
 * descoberta é o que sustenta R$ 250 a aula.
 *
 * A ordem das três portas é a que a Isabela pediu, e ela não muda.
 */
export default function Home() {
  const igatu = TRAJETORIA.find((e) => e.id === "xique-xique")!;

  return (
    <>
      <HeroHome />
      <Portas />
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
      </section>

      <PrintsEmBreve />
      <ConviteFinal />
    </>
  );
}
