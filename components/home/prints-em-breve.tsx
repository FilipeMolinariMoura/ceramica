import { Container } from "@/components/section";

/**
 * A quarta coisa que a Isabela quer vender, ainda sem loja.
 *
 * Faixa, e não card: um quarto card quebraria o catálogo de três e prometeria
 * uma página que não existe. Aqui ela avisa que vem, sem link para lugar
 * nenhum — link que não leva a nada é pior do que aviso nenhum.
 */
export function PrintsEmBreve() {
  return (
    <section className="bg-verde py-10">
      <Container className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <p className="versalete-larga text-[0.62rem] text-branco/70">Em breve</p>
          <p className="versalete font-display text-2xl text-branco sm:text-[1.7rem]">
            Compre aqui · Prints
          </p>
        </div>
        <p className="max-w-sm text-[0.92rem] leading-relaxed text-branco/85">
          Impressões das ilustrações e das gravuras da Isabela, em tiragem
          pequena. A loja abre em breve.
        </p>
      </Container>
    </section>
  );
}
