import Image from "next/image";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { midiasDaSecao, urlDaMidia } from "@/lib/midias";
import { ATELIE } from "@/lib/obras";
import { cn } from "@/lib/utils";

/**
 * As fotos do ateliê. Duas apresentações do mesmo material:
 *
 * - "faixa": rola na horizontal, na página da cerâmica, onde é um aperitivo.
 * - "grade": grade assimétrica, na página de obras, onde é o conteúdo.
 *
 * ── Agora quem escolhe é ela ──────────────────────────────────────────────
 * A vaga `atelie` existia no painel desde o começo, com espaço para doze
 * fotos, e NINGUÉM a lia: a galeria era uma lista fixa em código. A Isabela
 * podia subir foto, marcar "galeria do ateliê" e não ver diferença nenhuma no
 * site — que é pior do que não ter o controle, porque parece quebrado.
 *
 * Se ela não escolher nada, valem as fotos do repositório. O site nunca fica
 * com buraco; é a mesma regra de `components/foto-da-secao.tsx`.
 *
 * As legendas dizem o que a foto é, e não fingem ser título de peça à venda.
 * Nas que ela subir, a legenda é o texto alternativo que ela mesma escreveu —
 * é o único texto que existe, e obrigá-la a escrever dois seria pedir demais
 * por pouco.
 */
export async function GaleriaAtelie({
  variante = "grade",
}: {
  variante?: "faixa" | "grade";
}) {
  const escolhidas = await midiasDaSecao("atelie");

  const fotos =
    escolhidas.length > 0
      ? escolhidas.map((m) => ({
          chave: m.id,
          src: urlDaMidia(m.id),
          largura: m.largura,
          altura: m.altura,
          alt: m.alt || "Foto do ateliê",
          legenda: m.alt || "No ateliê",
          formato: m.largura >= m.altura ? ("larga" as const) : ("alta" as const),
        }))
      : ATELIE.map((f) => ({
          chave: f.legenda,
          src: f.src,
          largura: null,
          altura: null,
          alt: f.alt,
          legenda: f.legenda,
          formato: f.formato as "larga" | "alta",
        }));

  /* As duas fontes rendem de formas diferentes de propósito: a do repositório
     é import estático e ganha `placeholder="blur"` de graça; a dela vem de
     `/midias/<id>` e não tem blur, mas a caixa já tem proporção fixa, então
     não há salto de layout em nenhum dos dois casos. */
  const Foto = ({
    foto,
    sizes,
    className,
  }: {
    foto: (typeof fotos)[number];
    sizes: string;
    className?: string;
  }) =>
    typeof foto.src === "string" ? (
      <Image
        src={foto.src}
        alt={foto.alt}
        fill
        quality={85}
        sizes={sizes}
        className={className}
      />
    ) : (
      <Image
        src={foto.src}
        alt={foto.alt}
        fill
        placeholder="blur"
        quality={85}
        sizes={sizes}
        className={className}
      />
    );

  if (variante === "faixa") {
    return (
      <div className="-mx-6 overflow-x-auto px-6 pb-3 sm:-mx-8 sm:px-8 [scrollbar-width:thin]">
        <ul className="flex w-max gap-4">
          {fotos.map((foto) => (
            <li key={foto.chave} className="w-[16rem] shrink-0 sm:w-[20rem]">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Foto
                  foto={foto}
                  sizes="(max-width: 640px) 16rem, 20rem"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 line-clamp-2 text-[0.82rem] uppercase tracking-[0.14em] text-preto/50">
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
      {fotos.map((foto, i) => (
        <Reveal
          key={foto.chave}
          indice={i % 3}
          tipo="foto"
          className={cn(foto.formato === "larga" && "sm:col-span-2")}
        >
          <figure>
            <div
              className={cn(
                "relative w-full overflow-hidden",
                foto.formato === "alta" ? "aspect-[4/5]" : "aspect-[3/2]"
              )}
            >
              <Foto
                foto={foto}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw"
                className="object-cover transition-transform duration-[900ms] ease-out hover:scale-[1.03]"
              />
            </div>
            <figcaption className="mt-3 line-clamp-2 text-[0.82rem] uppercase tracking-[0.14em] text-preto/50">
              {foto.legenda}
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </Container>
  );
}
