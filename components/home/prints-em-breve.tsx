import Image from "next/image";
import { Container } from "@/components/section";
import { OBRAS } from "@/lib/obras";

/**
 * A quarta coisa que a Isabela quer vender, ainda sem loja.
 *
 * Continua sendo AVISO e não porta: faixa em vez de cartão, e nenhum link.
 * Um quarto cartão quebraria o catálogo de três e prometeria uma página que
 * não existe — e link que não leva a nada é pior do que aviso nenhum.
 *
 * ── O único lugar do site que usa risografia ──────────────────────────────
 * O tratamento de duotone (`.riso` em `globals.css`) existe por causa do
 * cartaz que ele mandou de referência: uma tinta só, trama de pontos, papel
 * creme. Ele poderia ter sido espalhado pelas fotos do ateliê, e teria ficado
 * bonito e errado — quem está decidindo pagar R$ 250 numa aula precisa ver a
 * sala como ela é, não estilizada.
 *
 * Aqui ele é literal: a seção anuncia IMPRESSOS, e a imagem é um desenho dela
 * mostrado como impresso. A técnica coincide com o assunto, que é a única
 * licença para usá-la.
 */
export function PrintsEmBreve() {
  const desenho = OBRAS.find((o) => o.id === "entrelacos-entre-mundos")!;

  return (
    <section className="bg-preto py-12 sm:py-14">
      <Container className="grid items-center gap-8 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-12">
        <div className="riso relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={desenho.foto}
            alt={desenho.alt}
            fill
            quality={80}
            sizes="(max-width: 640px) 90vw, 16rem"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="rotulo text-osso">Em breve</p>
          <p className="versalete font-display text-[1.8rem] leading-none text-papel sm:text-[2.4rem]">
            Compre aqui · Prints
          </p>
          <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-papel/65">
            Impressões das pinturas e dos desenhos, em tiragem pequena e
            numerada. A loja abre em breve.
          </p>
        </div>
      </Container>
    </section>
  );
}
