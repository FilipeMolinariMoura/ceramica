import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";

/**
 * Abertura das páginas internas. Sem foto: a barra é fixa e transparente, e
 * uma foto pequena atrás dela vira uma tarja. Aqui o espaço em branco é que
 * abre a página — e a foto aparece logo abaixo, no tamanho que merece.
 */
export function PageHero({
  eyebrow,
  titulo,
  destaque,
  texto,
  children,
}: {
  eyebrow: string;
  titulo: React.ReactNode;
  /** Parte do título em itálico cobalto. Vem depois de `titulo`. */
  destaque?: string;
  texto?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-papel pb-14 pt-[8.5rem] sm:pb-16 sm:pt-[10rem]">
      <Container>
        <div data-enter className="flex max-w-3xl flex-col items-start gap-6">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="font-display text-[2.5rem] font-light leading-[1.06] tracking-[-0.02em] text-preto sm:text-5xl lg:text-[3.6rem]">
            {titulo}
            {destaque ? (
              <>
                {" "}
                <em className="font-normal italic text-vermelho">{destaque}</em>
              </>
            ) : null}
          </h1>
          {texto ? (
            <p className="max-w-xl text-[1.08rem] leading-relaxed text-grafite/85">
              {texto}
            </p>
          ) : null}
          {children}
        </div>
      </Container>
    </section>
  );
}
