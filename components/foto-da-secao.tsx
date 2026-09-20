import Image from "next/image";
import { midiasDaSecao, urlDaMidia } from "@/lib/midias";
import { VAGA_POR_CHAVE } from "@/lib/secoes-de-foto";

/**
 * A foto de uma vaga do site.
 *
 * Mostra o que a Isabela escolheu no painel; se ela não escolheu nada, mostra
 * a foto padrão do repositório. Nunca fica buraco — e é isso que permite
 * entregar o painel sem antes precisar que ela suba todas as fotos.
 *
 * As duas fontes rendem `next/image` de formas diferentes de propósito: a
 * padrão é import estático e ganha `placeholder="blur"` de graça; a dela vem
 * de `/midias/<id>` e precisa de largura e altura explícitas, que estão
 * guardadas na linha — sem isso o construtor de página produziria salto de
 * layout em tudo que ela montasse.
 */
export async function FotoDaSecao({
  chave,
  className,
  sizes = "100vw",
  priority = false,
  quality = 88,
}: {
  chave: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
}) {
  const vaga = VAGA_POR_CHAVE.get(chave);
  const escolhidas = await midiasDaSecao(chave);
  const escolhida = escolhidas[0];

  if (escolhida) {
    return (
      <Image
        src={urlDaMidia(escolhida.id)}
        alt={escolhida.alt || vaga?.nome || ""}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        className={className}
      />
    );
  }

  if (!vaga?.padrao) return null;

  return (
    <Image
      src={vaga.padrao.src}
      alt={vaga.padrao.alt}
      fill
      placeholder="blur"
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={className}
    />
  );
}
