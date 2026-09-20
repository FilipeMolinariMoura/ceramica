import { Container } from "@/components/section";
import { cn } from "@/lib/utils";

/**
 * O cabeçalho de seção da referência.
 *
 * CENTRADO, título em versalete vermelho, e duas linhas curtas de subtítulo
 * logo abaixo, também em vermelho e bem menores. É o mesmo bloco que na
 * referência abre "FEATURED CLASSES" e "GIFT CARDS", e é o que dá o ritmo de
 * catálogo à página.
 *
 * A versão anterior alinhava tudo à esquerda com um filete e uma sobrelinha
 * cinza. Ficava correto e genérico — parecia um site de serviço, não o
 * impresso que ela mandou.
 *
 * `tom` existe porque o mesmo bloco cai em seção de creme e em seção escura.
 * Sobre o escuro o vermelho dá 1,6:1 e some, então lá quem faz o papel de
 * acento é o creme — é por isso que a cor vem de `--color-realce` e não de
 * uma classe fixa.
 */
export function CabecalhoSecao({
  titulo,
  subtitulo,
  alinhamento = "centro",
  className,
}: {
  titulo: string;
  subtitulo?: string;
  alinhamento?: "centro" | "esquerda";
  className?: string;
}) {
  const centro = alinhamento === "centro";
  return (
    <Container
      className={cn(
        "flex flex-col gap-3",
        centro ? "items-center text-center" : "items-start",
        className
      )}
    >
      <h2 className="titulo-secao versalete font-display text-realce">
        {titulo}
      </h2>
      {subtitulo ? (
        <p
          className={cn(
            "max-w-sm text-[0.92rem] leading-snug text-realce/85",
            centro && "mx-auto"
          )}
        >
          {subtitulo}
        </p>
      ) : null}
    </Container>
  );
}
