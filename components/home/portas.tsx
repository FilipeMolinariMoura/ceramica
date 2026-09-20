import { FotoDaSecao } from "@/components/foto-da-secao";
import Link from "next/link";
import { Container } from "@/components/section";
import { CabecalhoSecao } from "@/components/cabecalho-secao";
import { Reveal } from "@/components/reveal";
import { reais, servicoPorSlug } from "@/lib/agenda";
import { SERVICO_AULA_AVULSA } from "@/lib/constants";

/**
 * O catálogo. Três portas, na ordem que a Isabela pediu.
 *
 * ── Por que não é mais um cartão com borda ────────────────────────────────
 * Porque a referência não tem cartão. Ela tem FOTO SOBRE FUNDO TINGIDO, e
 * embaixo, fora da foto, uma legenda pequena e o preço. Sem moldura, sem
 * sombra, sem seta. O que separa um item do outro é o espaço e o tingido do
 * fundo — é o que faz aquilo parecer catálogo impresso e não uma tela de
 * aplicativo.
 *
 * A versão anterior era o cartão genérico de sempre: borda de 1px, foto no
 * topo, título, texto, seta. Funcionava e não se parecia com nada que ela
 * tinha mandado.
 *
 * O preço aparece aqui, na primeira dobra. É o número que faz clicar, e ele
 * vem do banco — a Isabela muda pelo painel.
 */
const PORTAS = [
  {
    href: "/aulas",
    titulo: "Turma de aulas",
    texto: "Avulsa com hora marcada, ou turma mensal de seis.",
    chaveFoto: "home.porta.aulas",
    /* O fundo atrás da foto muda por porta, como na referência, onde cada
       produto assenta num tingido diferente. */
    tingido: "bg-verde-claro/45",
  },
  {
    href: "/oficinas",
    titulo: "Sua oficina",
    texto: "Aniversário, time, bodas. A gente monta e leva.",
    chaveFoto: "home.porta.oficinas",
    tingido: "bg-vermelho/10",
  },
  {
    href: "/atendimentos",
    titulo: "Atendimento 1:1",
    texto: "Tarot e astrologia, em sessão individual.",
    chaveFoto: "home.porta.atendimentos",
    tingido: "bg-preto/[0.07]",
  },
] as const;

export async function Portas() {
  const servico = await servicoPorSlug(SERVICO_AULA_AVULSA);
  const preco = servico ? reais(servico.precoCentavos) : null;

  const valor: Record<string, string> = {
    "/aulas": preco ? `a partir de ${preco}` : "sob consulta",
    "/oficinas": "sob orçamento",
    "/atendimentos": "sob consulta",
  };

  return (
    <section className="creme py-16 sm:py-20 lg:py-24">
      <CabecalhoSecao
        titulo="O que tem aqui"
        subtitulo="Três portas para o ateliê, e nenhuma delas exige experiência nenhuma."
        className="mb-10 sm:mb-12"
      />

      <Container className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {PORTAS.map((porta, i) => (
          <Reveal key={porta.href} indice={i} tipo="cartao">
            <Link href={porta.href} className="group block">
              <div
                className={`relative aspect-[4/3] w-full overflow-hidden ${porta.tingido}`}
              >
                <FotoDaSecao
                  chave={porta.chaveFoto}
                  quality={86}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                />
              </div>

              <div className="mt-3.5 flex flex-col gap-1">
                <h3 className="text-[0.95rem] font-medium text-realce transition-colors group-hover:text-vermelho-escuro">
                  {porta.titulo}
                </h3>
                <p className="text-[0.85rem] leading-snug text-texto/60">
                  {porta.texto}
                </p>
                <p className="mt-0.5 font-display text-[1.05rem] text-texto">
                  {valor[porta.href]}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}
