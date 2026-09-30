import type { Metadata } from "next";
import { EscolhaAula } from "@/components/agenda/escolha-aula";
import { Sobre } from "@/components/sections/sobre";
import { DoisCaminhos } from "@/components/sections/dois-caminhos";
import { Incluso } from "@/components/sections/incluso";
import { ParaQuem } from "@/components/sections/para-quem";
import { QuemConduz } from "@/components/sections/quem-conduz";
import { Quebra } from "@/components/sections/quebra";
import { Informacoes } from "@/components/sections/informacoes";
import { Prova } from "@/components/sections/prova";
import { Faq } from "@/components/sections/faq";
import { CtaFinal } from "@/components/sections/cta-final";
import { RetornoInscricao } from "@/components/retorno-inscricao";

// A agenda lê o banco a cada visita. Sem isto o Next tentaria prerenderizar
// esta página no `docker build`, onde não existe Postgres, e o build quebraria.
export const dynamic = "force-dynamic";

const description =
  "Aulas de cerâmica às terças em Pinheiros: turma mensal a partir de R$ 200 por aula ou aula avulsa, com horário marcado e pagamento online. Com a artista visual Isabela Molinari.";

export const metadata: Metadata = {
  title: "Aulas de cerâmica",
  description,
  alternates: { canonical: "/aulas" },
  openGraph: {
    title: "Aulas de cerâmica · Isabela Molinari",
    description,
    url: "/aulas",
  },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

/**
 * A landing original, inteira, virou esta aba. Ela é a página que converte —
 * e por isso continua sendo uma página longa de argumento, com o próprio CTA.
 *
 * A PRIMEIRA DOBRA É A COMPRA. O hero de texto saiu: quem chega aqui já
 * clicou em "marcar aula" em algum lugar, e a próxima coisa que precisa ver é
 * o que escolher, quanto custa e quando — não uma frase sobre o barro. O
 * argumento continua todo aí embaixo, para quem quiser ler antes de decidir.
 *
 * Os parâmetros da URL vêm dos cartões da home: `?horario=ID` abre o
 * pagamento daquela data direto; `?plano=mensal&turma=manha` já chega com a
 * escolha feita; `?origem=` diz de onde a pessoa veio, para a Isabela saber
 * qual porta vende.
 */
export default async function Aulas({ searchParams }: Props) {
  const busca = await searchParams;
  const horario = Number(texto(busca.horario));

  return (
    <>
      <EscolhaAula
        plano={texto(busca.plano)}
        turma={texto(busca.turma)}
        horarioId={Number.isInteger(horario) && horario > 0 ? horario : undefined}
        origem={/^[a-z0-9-]{1,40}$/.test(texto(busca.origem) ?? "") ? texto(busca.origem) : "aulas"}
      />
      <Sobre />
      <DoisCaminhos />
      <Incluso />
      <ParaQuem />
      <QuemConduz />
      <Quebra />
      <Informacoes />
      <Prova />
      <Faq />
      <CtaFinal />
      <RetornoInscricao />
    </>
  );
}
