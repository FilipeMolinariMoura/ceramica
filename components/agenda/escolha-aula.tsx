import { Container } from "@/components/section";
import { FotoDaSecao } from "@/components/foto-da-secao";
import {
  EscolhaAulaCliente,
  type PacoteVisivel,
  type PrecosVisiveis,
  type SlotVisivel,
} from "@/components/agenda/escolha-aula-cliente";
import {
  chaveDia,
  diaCurto,
  diaLongo,
  diaSemanaCurto,
  horaCurta,
  horariosDisponiveis,
  montarPacotes,
  precosDaMensal,
  reais,
  servicoPorSlug,
  turmaDe,
} from "@/lib/agenda";
import { SERVICO_AULA_AVULSA, SERVICO_TURMA_MENSAL, TURMAS, type TurmaId } from "@/lib/constants";

/**
 * A seção que vende — as duas coisas, lado a lado.
 *
 * Antes eram duas portas diferentes: a avulsa tinha agenda e pagamento, a
 * mensal tinha um formulário que abria o WhatsApp. Quem chegava tinha de ler
 * para descobrir que existiam as duas, e a mais vantajosa era a que dava mais
 * trabalho de comprar.
 *
 * Agora é uma escolha só, com a mensal na frente e o preço dela POR AULA —
 * R$ 200 ao lado dos R$ 250 da avulsa. Nenhum número aqui é fixo: tudo sai do
 * banco (preço, pacote, vagas), e a Isabela muda pelo painel.
 *
 * É Server Component e lê o banco a cada visita (ver `dynamic` na página):
 * agenda em cache mostraria vaga já vendida. Toda data vira TEXTO aqui, em
 * horário de Brasília; o cliente recebe rótulo pronto e nunca formata data.
 */
export async function EscolhaAula({
  plano,
  turma,
  horarioId,
  origem,
  emBloco = false,
}: {
  plano?: string;
  turma?: string;
  horarioId?: number;
  origem?: string;
  /** Dentro de uma página montada pelo painel: sem h1 e sem folga da barra. */
  emBloco?: boolean;
}) {
  const [avulsa, mensal] = await Promise.all([
    servicoPorSlug(SERVICO_AULA_AVULSA),
    servicoPorSlug(SERVICO_TURMA_MENSAL),
  ]);
  if (!avulsa) return null;

  // 120 dias: o último início de pacote precisa de três terças depois dele.
  const horarios = await horariosDisponiveis(avulsa.id, { diasAFrente: 120 });

  // A avulsa só oferece as próximas ~8 semanas; a régua não precisa de mais.
  const limiteAvulsa = Date.now() + 60 * 86_400_000;
  const slots: SlotVisivel[] = horarios
    .filter((h) => h.inicio.getTime() < limiteAvulsa)
    .map((h) => ({
      id: h.id,
      chave: chaveDia(h.inicio),
      dia: diaSemanaCurto(h.inicio),
      data: diaCurto(h.inicio),
      diaLongo: diaLongo(h.inicio),
      hora: horaCurta(h.inicio),
      turma: turmaDe(h.inicio),
      restantes: h.restantes,
      vagas: h.vagas,
    }));

  const porId = new Map(horarios.map((h) => [h.id, h]));
  const pacotes = {} as Record<TurmaId, PacoteVisivel[]>;
  for (const t of TURMAS) {
    pacotes[t.id] = mensal
      ? montarPacotes(horarios, t.id, mensal.aulas)
          // Só os inícios que existem de fato: um pacote que não chega a ter
          // quatro terças abertas não é opção, é ruído.
          .filter((o) => o.motivo !== "faltam_tercas")
          .slice(0, 8)
          .map((o) => ({
            inicioId: o.inicioId,
            ids: o.ids,
            datas: o.inicios.map(diaCurto),
            inicioLongo: diaLongo(o.inicios[0]!),
            restantes: o.ids.map((id) => porId.get(id)?.restantes ?? 0),
            vagas: o.ids.map((id) => porId.get(id)?.vagas ?? 0),
            disponivel: o.disponivel,
          }))
      : [];
  }

  const p = mensal ? precosDaMensal(avulsa, mensal) : null;
  const precos: PrecosVisiveis = {
    avulsa: reais(avulsa.precoCentavos),
    duracaoMin: avulsa.duracaoMin,
    mensal: p
      ? {
          aulas: p.aulas,
          pix: reais(p.pixCentavos),
          cartao: reais(p.cartaoCentavos),
          porAula: reais(p.porAulaPixCentavos),
          economia: reais(p.economiaCentavos),
          pct: p.pctEconomia,
          cartaoDifere: p.cartaoCentavos !== p.pixCentavos,
        }
      : null,
  };

  return (
    <section
      id="agenda"
      className={
        emBloco
          ? "creme scroll-mt-20 py-20 sm:py-24"
          : "creme scroll-mt-20 pb-20 pt-[6.5rem] sm:pb-24 sm:pt-[7.5rem]"
      }
    >
      <Container
        className={emBloco ? undefined : "lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-14"}
      >
        <EscolhaAulaCliente
          // Chave pelos parâmetros: um link interno para `?plano=mensal` com a
          // página já aberta precisa remontar a escolha, não só re-renderizar.
          key={`${plano}-${turma}-${horarioId}`}
          slots={slots}
          pacotes={pacotes}
          precos={precos}
          inicial={{
            plano: plano === "avulsa" || plano === "mensal" ? plano : undefined,
            turma: turma === "manha" || turma === "tarde" ? turma : undefined,
            horarioId,
          }}
          origem={origem}
          titulo={emBloco ? "h2" : "h1"}
        />
        {/* A foto do painel (`aulas.hero`) ao lado da escolha, só em tela
            larga. No celular ela empurraria a compra para baixo da dobra. */}
        {emBloco ? null : (
          // `sticky` no invólucro: `.sobreimpressao` fixa `position: relative`
          // fora das camadas do Tailwind e ganharia da classe utilitária.
          <div className="sticky top-28 hidden pt-4 lg:block">
            <div className="sobreimpressao">
              <div className="fuga relative aspect-[4/5] w-full overflow-hidden">
                <FotoDaSecao
                  chave="aulas.hero"
                  priority
                  quality={88}
                  sizes="22rem"
                  className="hero-img object-cover object-center"
                />
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
