import Image from "next/image";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { ATELIE } from "@/lib/obras";
import { cn } from "@/lib/utils";

/**
 * As fotos do ateliê. Duas apresentações do mesmo material:
 *
 * - "faixa": rola na horizontal, para a home, onde é um aperitivo.
 * - "grade": grade assimétrica, para a página de obras, onde é o conteúdo.
 *
 * As legendas dizem o que a foto é ("Mesa coletiva", "Engobe, camada a
 * camada"), e não fingem ser título de peça à venda.
 */
export function GaleriaAtelie({
  variante = "grade",
}: {
  variante?: "faixa" | "grade";
}) {
  if (variante === "faixa") {
    return (
      <div className="-mx-6 overflow-x-auto px-6 pb-3 sm:-mx-8 sm:px-8 [scrollbar-width:thin]">
        <ul className="flex w-max gap-4">
          {ATELIE.map((foto) => (
            <li
              key={foto.legenda}
              className="w-[16rem] shrink-0 sm:w-[20rem]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-none">
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  fill
                  placeholder="blur"
                  quality={85}
                  sizes="(max-width: 640px) 16rem, 20rem"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-[0.82rem] uppercase tracking-[0.14em] text-preto/50">
                {foto.legenda}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <Container className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ATELIE.map((foto, i) => (
        <Reveal
          key={foto.legenda}
          indice={i % 3}
          tipo="foto"
          className={cn(foto.formato === "larga" && "sm:col-span-2")}
        >
          <figure>
            <div
              className={cn(
                "relative w-full overflow-hidden rounded-none",
                foto.formato === "alta" ? "aspect-[4/5]" : "aspect-[3/2]"
              )}
            >
              <Image
                src={foto.src}
                alt={foto.alt}
                fill
                placeholder="blur"
                quality={88}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw"
                className="object-cover transition-transform duration-[900ms] ease-out hover:scale-[1.03]"
              />
            </div>
            <figcaption className="mt-3 text-[0.82rem] uppercase tracking-[0.14em] text-preto/50">
              {foto.legenda}
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </Container>
  );
}
