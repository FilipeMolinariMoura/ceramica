import Image, { type StaticImageData } from "next/image";
import { Container } from "@/components/section";

/**
 * Uma imagem que atravessa a página de ponta a ponta, com legenda.
 *
 * Existe para UMA foto: a queima a céu aberto em Igatu, na Chapada
 * Diamantina, durante a residência de 2025 — peças empilhadas numa torre de
 * tijolos sobre o fogo, à noite. É a imagem mais forte do arquivo inteiro e
 * estava num PDF fechado.
 *
 * Ela ganha largura total porque é isso que uma imagem assim faz numa revista:
 * corta o texto, muda a respiração e prova em um quadro o que três parágrafos
 * tentam dizer. Numa grade de três colunas ela viraria mais uma miniatura.
 *
 * A legenda fica na coluna de texto, não sobre a foto: sobreposto obrigaria
 * uma tarja de escurecimento, e a foto já é quase toda preta.
 */
export function FaixaObra({
  foto,
  alt,
  legenda,
  altura = "alta",
}: {
  foto: StaticImageData;
  alt: string;
  legenda: string;
  /** `alta` para retrato de tela cheia; `baixa` para uma faixa de respiro. */
  altura?: "alta" | "baixa";
}) {
  return (
    <section className="bg-preto">
      <div
        className={
          altura === "alta"
            ? "relative h-[62vh] min-h-[22rem] w-full sm:h-[78vh]"
            : "relative aspect-[16/7] w-full"
        }
      >
        <Image
          src={foto}
          alt={alt}
          fill
          placeholder="blur"
          quality={88}
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <Container className="py-4">
        <p className="ficha-parede text-papel/55">{legenda}</p>
      </Container>
    </section>
  );
}
