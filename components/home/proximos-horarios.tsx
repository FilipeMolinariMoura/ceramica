import Link from "next/link";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import {
  diaLongo,
  hora,
  horariosDisponiveis,
  reais,
  servicoPorSlug,
} from "@/lib/agenda";
import { FECHAMENTO, SERVICO_AULA_AVULSA, WHATSAPP_DUVIDA } from "@/lib/constants";

/**
 * O FECHAMENTO, na home.
 *
 * ── O problema ────────────────────────────────────────────────────────────
 * Até aqui a home apresentava e a compra acontecia noutro lugar: para marcar
 * uma aula era preciso clicar em "Aulas", chegar numa página longa de
 * argumento e rolar até a agenda. Três passos entre a vontade e a vaga, e a
 * vontade não sobrevive a três passos.
 *
 * Esta faixa traz os PRÓXIMOS HORÁRIOS REAIS para a primeira página — dia,
 * hora, quantas vagas restam — e cada um é um link direto para a agenda. Não
 * é um banner dizendo "marque sua aula": é a coisa em si, com data.
 *
 * ── Por que só três ───────────────────────────────────────────────────────
 * Porque a lista inteira é a página de aulas. Aqui o trabalho é provar que há
 * vaga esta semana e dar um caminho de um clique. Dezoito horários numa faixa
 * de home viram tabela para auditar, que é o defeito que a agenda já teve uma
 * vez neste projeto.
 *
 * ── E quando não há nenhum ────────────────────────────────────────────────
 * A seção some inteira. Uma faixa de fechamento vazia é pior que ausente: ela
 * ocupa a melhor posição da página para dizer que não há nada à venda. Nesse
 * caso quem fecha é o WhatsApp, que é a verdade — a Isabela abre horário sob
 * demanda.
 */
export async function ProximosHorarios() {
  const servico = await servicoPorSlug(SERVICO_AULA_AVULSA);
  if (!servico) return null;

  const todos = await horariosDisponiveis(servico.id, { diasAFrente: 45 });
  const comVaga = todos.filter((h) => h.restantes > 0);
  const proximos = comVaga.slice(0, 3);

  const preco = reais(servico.precoCentavos);

  return (
    <section className="bg-preto py-14 text-papel sm:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="flex flex-col gap-2.5">
            <p className="rotulo text-osso">Aula avulsa · {preco}</p>
            <h2 className="titulo-secao versalete max-w-lg font-display text-papel">
              {proximos.length > 0
                ? "Tem vaga esta semana"
                : "Peça um horário"}
            </h2>
            <p className="max-w-md text-[0.98rem] leading-relaxed text-papel/65">
              {proximos.length > 0
                ? `Duas horas de mão no barro, com dia e hora marcados. Você paga aqui e vem — barro, ferramentas, esmalte e queima inclusos.`
                : "A Isabela abre horário conforme a semana. Chame no WhatsApp e ela encaixa você."}
            </p>
          </div>

          {proximos.length > 0 ? (
            <Link
              href={FECHAMENTO}
              className="inline-flex h-[3.1rem] shrink-0 items-center justify-center self-start border border-papel/40 px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-papel transition-[background-color,color,border-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:border-papel hover:bg-papel hover:text-preto active:translate-y-px sm:self-auto"
            >
              Ver todos os horários
            </Link>
          ) : null}
        </div>

        {proximos.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-3">
            {proximos.map((h, i) => (
              <Reveal key={h.id} indice={i} tipo="cartao">
                <li>
                  <Link
                    href={FECHAMENTO}
                    className="group flex h-full flex-col justify-between gap-5 border border-papel/25 p-5 transition-[background-color,border-color] duration-[var(--t-estado)] hover:border-papel hover:bg-papel/5"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="versalete-larga text-[0.58rem] text-papel/50">
                        {diaLongo(h.inicio)}
                      </span>
                      <span className="numeral text-[2rem] leading-none text-papel">
                        {hora(h.inicio)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[0.8rem] text-papel/60">
                        {h.restantes === 1
                          ? "última vaga"
                          : `${h.restantes} vagas`}
                      </span>
                      <span className="versalete-larga text-[0.6rem] text-osso transition-colors group-hover:text-papel">
                        Reservar
                      </span>
                    </div>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        ) : (
          <a
            href={WHATSAPP_DUVIDA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[3.1rem] w-fit items-center justify-center bg-vermelho px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-branco transition-[background-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:bg-vermelho-escuro active:translate-y-px"
          >
            Pedir um horário
          </a>
        )}
      </Container>
    </section>
  );
}
