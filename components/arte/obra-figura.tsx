import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { ficha, type Obra } from "@/lib/obras";

/**
 * Uma obra, com ficha de parede.
 *
 * TRÊS DECISÕES, e as três são sobre respeitar o trabalho:
 *
 * 1. `object-contain`, nunca `cover`. "Do interdito ao céu" tem 2,09 × 1,75 m
 *    e é feito de nove folhas — cortá-lo num quadrado para a grade ficar
 *    bonita destrói a obra para arrumar o layout. O que preenche a sobra é o
 *    tingido de osso, a cor do papel dos desenhos dela, e a sobra passa a
 *    parecer passe-partout em vez de erro.
 *
 * 2. A ficha fica FORA da imagem, embaixo, miúda. É a convenção de parede de
 *    galeria e é o que a referência de catálogo também faz — legenda e preço
 *    abaixo da foto, nunca por cima. Legenda sobre a imagem é vitrine de
 *    e-commerce.
 *
 * 3. Sem link, sem hover que amplia, sem "ver mais". A obra não leva a lugar
 *    nenhum porque não está à venda — encomenda é outra porta, e é conversa.
 *    Um cartão clicável aqui prometeria uma página de produto que não existe.
 */
export function ObraFigura({
  obra,
  indice,
  prioridade = false,
  className = "",
}: {
  obra: Obra;
  indice?: number;
  prioridade?: boolean;
  className?: string;
}) {
  return (
    <Reveal tipo="foto" indice={indice} className={className}>
      <figure className="flex h-full flex-col">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-osso/35 p-4 sm:p-6">
          <Image
            src={obra.foto}
            alt={obra.alt}
            fill
            placeholder="blur"
            quality={88}
            priority={prioridade}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="object-contain p-4 sm:p-6"
          />
        </div>

        <figcaption className="ficha-parede mt-3.5 text-texto/60">
          <em className="text-texto">{obra.titulo}</em>
          {", "}
          {obra.ano}
          <br />
          {ficha(obra)}
        </figcaption>
      </figure>
    </Reveal>
  );
}
