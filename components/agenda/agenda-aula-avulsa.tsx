import { Container } from "@/components/section";
import { Eyebrow } from "@/components/eyebrow";
import { SeletorHorario, type HorarioVisivel } from "@/components/agenda/seletor-horario";
import {
  chaveDia,
  diaCurto,
  diaLongo,
  hora,
  horariosDisponiveis,
  reais,
  servicoPorSlug,
} from "@/lib/agenda";
import { SERVICO_AULA_AVULSA, WHATSAPP_DUVIDA } from "@/lib/constants";

/**
 * A seção que vende.
 *
 * É Server Component e lê o banco a cada visita (ver `dynamic` na página): uma
 * agenda em cache mostraria vaga que já foi vendida, e a pessoa só descobriria
 * depois de preencher o formulário.
 *
 * Toda data vira TEXTO aqui, no servidor, em horário de Brasília. O cliente
 * recebe rótulo pronto e nunca formata data — ver `seletor-horario.tsx`.
 */
export async function AgendaAulaAvulsa() {
  const servico = await servicoPorSlug(SERVICO_AULA_AVULSA);
  if (!servico) return null;

  // Os esgotados VÃO para a tela, riscados. Antes eram filtrados fora, e com
  // isso a agenda parecia vazia de procura: ver a vaga que já foi é o que faz
  // a vaga que sobrou valer alguma coisa.
  const horarios = await horariosDisponiveis(servico.id);
  const visiveis: HorarioVisivel[] = horarios.map((h) => ({
    id: h.id,
    dia: chaveDia(h.inicio),
    diaLongo: diaLongo(h.inicio),
    diaCurto: diaCurto(h.inicio),
    hora: hora(h.inicio),
    restantes: h.restantes,
  }));

  const preco = reais(servico.precoCentavos);

  return (
    <section id="agenda" className="scroll-mt-24 bg-branco py-20 sm:py-24">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col gap-5">
          <Eyebrow>Aula avulsa</Eyebrow>
          <h2 className="titulo-secao versalete font-display text-vermelho">
            Uma aula,
            <br />
            sem assinar o mês
          </h2>
          <p className="text-[1.02rem] leading-relaxed text-grafite/85">
            Duas horas no torno ou na modelagem, com acompanhamento individual.
            Barro, ferramentas, esmalte e queima inclusos. Não precisa ter
            experiência.
          </p>

          <dl className="mt-1 divide-y divide-linha border-y border-linha">
            {[
              ["Valor", preco],
              ["Duração", `${servico.duracaoMin} minutos`],
              ["Vagas por horário", String(servico.vagasPadrao)],
              ["Onde", "Pinheiros, São Paulo"],
            ].map(([rotulo, valor]) => (
              <div key={rotulo} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="versalete-larga text-[0.66rem] text-preto/50">
                  {rotulo}
                </dt>
                <dd className="text-right text-[0.98rem] font-medium text-preto">
                  {valor}
                </dd>
              </div>
            ))}
          </dl>

          <p className="text-[0.85rem] leading-relaxed text-grafite/70">
            Alguma dúvida antes de reservar?{" "}
            <a
              href={WHATSAPP_DUVIDA}
              target="_blank"
              rel="noopener noreferrer"
              className="text-vermelho underline underline-offset-4 transition-colors duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:text-vermelho-escuro"
            >
              Chame no WhatsApp
            </a>
            .
          </p>
        </div>

        <SeletorHorario
          horarios={visiveis}
          precoFormatado={preco}
          duracaoMin={servico.duracaoMin}
        />
      </Container>
    </section>
  );
}
