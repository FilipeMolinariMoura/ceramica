import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { ESTADO_ROTULO, precoFormatado, type Obra } from "@/lib/obras";
import { whatsappObra } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Uma peça. Sem carrinho: o botão leva ao WhatsApp com o nome da peça já na
 * mensagem, que é como a Isabela já vende. Peça vendida continua no ar, sem
 * link — o acervo é parte do portfólio.
 */
export function ObraCard({ obra, delay = 0 }: { obra: Obra; delay?: number }) {
  const vendida = obra.estado === "vendida";

  const conteudo = (
    <>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-none bg-branco">
        <Image
          src={obra.foto}
          alt={obra.alt}
          fill
          placeholder="blur"
          quality={90}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn(
            "object-cover transition-transform duration-[900ms] ease-out",
            !vendida && "group-hover:scale-[1.04]",
            vendida && "opacity-80 saturate-[0.85]"
          )}
        />
        {obra.estado !== "disponivel" ? (
          <span className="absolute left-4 top-4 bg-papel/90 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-preto/70 backdrop-blur-sm">
            {ESTADO_ROTULO[obra.estado]}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <h3 className="font-display text-xl text-preto">{obra.nome}</h3>
        <p className="text-[0.95rem] text-preto/60">{obra.tecnica}</p>
        <p className="text-[0.88rem] text-preto/45">
          {obra.dimensoes} · {obra.ano}
        </p>
        <p
          className={cn(
            "mt-1 font-display text-lg",
            vendida ? "text-preto/40" : "text-vermelho"
          )}
        >
          {vendida ? "Vendida" : precoFormatado(obra)}
        </p>
      </div>
    </>
  );

  return (
    <Reveal indice={delay} tipo="cartao">
      {vendida ? (
        <article className="group">{conteudo}</article>
      ) : (
        <a
          href={whatsappObra(obra.nome)}
          target="_blank"
          rel="noopener noreferrer"
          className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vermelho"
        >
          {conteudo}
          <span className="mt-2 inline-block text-[0.9rem] text-preto/55 transition-colors group-hover:text-vermelho">
            Perguntar no WhatsApp →
          </span>
        </a>
      )}
    </Reveal>
  );
}
