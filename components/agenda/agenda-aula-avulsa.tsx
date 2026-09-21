import { Container } from "@/components/section";
import { SeletorHorario, type HorarioVisivel } from "@/components/agenda/seletor-horario";
import {
  chaveDia,
  diaLongo,
  hora,
  horariosDisponiveis,
  reais,
  servicoPorSlug,
} from "@/lib/agenda";
import { SERVICO_AULA_AVULSA, SITE, WHATSAPP_DUVIDA } from "@/lib/constants";

/**
 * A seção que vende.
 *
 * ── A composição veio do projeto da Landgraf ──────────────────────────────
 * Título à esquerda e o texto de apoio à direita, alinhados pela BASE
 * (`items-end`), e a condição que vale para todos os horários como FAIXA
 * depois da grade — não como mais um cartão. Lá isso separa "o que eu estou
 * escolhendo" de "o que vale para qualquer escolha", e é exatamente a
 * distinção que faltava aqui.
 *
 * A versão anterior era uma coluna à esquerda com uma tabela de valor,
 * duração, vagas e endereço, e a grade de horários à direita. O preço ficava
 * a meia tela de distância do botão que cobrava por ele.
 *
 * É Server Component e lê o banco a cada visita (ver `dynamic` na página):
 * agenda em cache mostraria vaga já vendida, e a pessoa só descobriria depois
 * de preencher o formulário.
 *
 * Toda data vira TEXTO aqui, no servidor, em horário de Brasília. O cliente
 * recebe rótulo pronto e nunca formata data.
 */
export async function AgendaAulaAvulsa() {
  const servico = await servicoPorSlug(SERVICO_AULA_AVULSA);
  if (!servico) return null;

  // Os esgotados VÃO para a tela. Ver a vaga que já foi é o que faz a vaga
  // que sobrou valer alguma coisa.
  const horarios = await horariosDisponiveis(servico.id);
  const visiveis: HorarioVisivel[] = horarios.map((h) => ({
    id: h.id,
    dia: chaveDia(h.inicio),
    diaLongo: diaLongo(h.inicio),
    hora: hora(h.inicio),
    restantes: h.restantes,
  }));

  /* "Hoje" também é calculado AQUI, em horário de Brasília. Deixar o
     calendário perguntar ao relógio do navegador contornaria o dia errado
     para quem abrisse de outro fuso — e, perto da meia-noite, para quem
     abrisse daqui mesmo. */
  const hoje = chaveDia(new Date());

  const preco = reais(servico.precoCentavos);

  const INCLUSO = [
    ["Barro e ferramentas", "Tudo o que se usa na aula"],
    ["Esmalte e queima", "As peças voltam prontas em ~3 semanas"],
    ["Acompanhamento", "Individual, do começo ao fim"],
  ] as const;

  return (
    <section id="agenda" className="creme scroll-mt-24 py-20 sm:py-24">
      <Container>
        <p className="rotulo">Aula avulsa</p>

        {/* Título curto e o calendário logo abaixo. O parágrafo de apoio que
            ficava aqui desceu para depois da grade: a Isabela pediu que "o
            calendário chegue rápido e sem muito texto", e quem chega decidido
            não deveria ler duas linhas antes de ver as datas. */}
        <h2 className="titulo-secao versalete mt-4 max-w-[16ch] font-display text-realce">
          Uma aula, sem assinar o mês
        </h2>

        <div className="mt-8">
          <SeletorHorario
            horarios={visiveis}
            precoFormatado={preco}
            duracaoMin={servico.duracaoMin}
            hoje={hoje}
          />
        </div>

        <p className="mt-8 max-w-[52ch] text-[0.95rem] leading-relaxed text-texto/60">
          Duas horas no torno ou na modelagem. Você escolhe o horário, paga
          aqui e vem — não precisa ter encostado em barro antes.
        </p>

        {/* A condição que vale para QUALQUER horário vem como faixa depois da
            grade, e não como mais um cartão: não é uma opção a escolher. */}
        <div className="carta mt-4 flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between">
          <dl className="grid flex-1 gap-5 sm:grid-cols-3">
            {INCLUSO.map(([titulo, texto]) => (
              <div key={titulo}>
                <dt className="text-[0.9rem] font-medium text-texto">{titulo}</dt>
                <dd className="mt-0.5 text-[0.82rem] leading-snug text-texto/55">
                  {texto}
                </dd>
              </div>
            ))}
          </dl>

          <div className="shrink-0 sm:border-l sm:border-borda sm:pl-7">
            <p className="text-[0.82rem] text-texto/55">No ateliê, em</p>
            <p className="text-[0.95rem] font-medium text-texto">{SITE.bairro}</p>
            <a
              href={WHATSAPP_DUVIDA}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-[0.82rem] text-realce underline underline-offset-4 transition-colors duration-[var(--t-toque)] hover:text-vermelho-escuro"
            >
              Tirar uma dúvida
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
