"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * O CALENDÁRIO DE MÊS.
 *
 * A Isabela mandou a referência e disse "eu gosto mt desse calendário": o do
 * Terreiro Aruanda. Grade do mês inteiro, cabeçalho DOM–SÁB, os dias que têm
 * alguma coisa com fundo destacado, o dia de hoje contornado, e setas para
 * andar de mês.
 *
 * ── Por que isto é melhor que a régua que havia ───────────────────────────
 * A régua horizontal mostrava dez dias e escondia o resto atrás de rolagem
 * lateral. Ela respondia "qual o próximo dia?" e não respondia "tem vaga este
 * mês?", que é a pergunta de quem está decidindo. A grade responde as duas de
 * uma olhada, e é a forma que todo mundo já sabe ler sem aprender nada.
 *
 * ── Fuso ──────────────────────────────────────────────────────────────────
 * Continua valendo a regra do projeto: o cliente NUNCA formata data. Os
 * rótulos chegam prontos do servidor, em horário de Brasília.
 *
 * A aritmética aqui é de CALENDÁRIO, não de fuso — quantos dias tem o mês, em
 * que coluna cai o dia 1 — e ela é feita com os getters `UTC`. Usar os locais
 * faria o dia 1 mudar de coluna conforme o relógio de quem abre a página, e a
 * grade inteira escorregaria para quem estivesse em Lisboa.
 */

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export type DiaDoCalendario = {
  /** `2026-09-22` */
  dia: string;
  /** "terça-feira, 22 de setembro" — vem pronto do servidor. */
  diaLongo: string;
  vagas: number;
  livre: boolean;
};

function partes(chave: string) {
  const [ano, mes, dia] = chave.split("-").map(Number);
  return { ano: ano!, mes: mes!, dia: dia! };
}

function chaveMes(chave: string) {
  return chave.slice(0, 7);
}

/** Lista contínua de meses entre o primeiro e o último — inclusive os vazios. */
function mesesEntre(primeiro: string, ultimo: string): string[] {
  const a = partes(`${primeiro}-01`);
  const b = partes(`${ultimo}-01`);
  const saida: string[] = [];
  let ano = a.ano;
  let mes = a.mes;
  while (ano < b.ano || (ano === b.ano && mes <= b.mes)) {
    saida.push(`${ano}-${String(mes).padStart(2, "0")}`);
    mes += 1;
    if (mes > 12) {
      mes = 1;
      ano += 1;
    }
  }
  return saida;
}

export function Calendario({
  dias,
  diaAtivo,
  hoje,
  aoEscolher,
}: {
  dias: DiaDoCalendario[];
  diaAtivo: string;
  /** `2026-09-21`, calculado no servidor em horário de Brasília. */
  hoje: string;
  aoEscolher: (dia: string) => void;
}) {
  const porDia = React.useMemo(
    () => new Map(dias.map((d) => [d.dia, d])),
    [dias]
  );

  const meses = React.useMemo(() => {
    if (dias.length === 0) return [];
    const chaves = dias.map((d) => chaveMes(d.dia)).sort();
    return mesesEntre(chaves[0]!, chaves[chaves.length - 1]!);
  }, [dias]);

  // Abre no mês do dia já selecionado — que o seletor escolheu como o primeiro
  // com vaga. Abrir sempre no mês corrente mostraria uma grade apagada quando
  // a próxima vaga só existe no mês seguinte.
  const [indice, setIndice] = React.useState(() => {
    const alvo = chaveMes(diaAtivo || dias[0]?.dia || "");
    const i = meses.indexOf(alvo);
    return i >= 0 ? i : 0;
  });

  if (meses.length === 0) return null;

  const mesAtual = meses[Math.min(indice, meses.length - 1)]!;
  const { ano, mes } = partes(`${mesAtual}-01`);

  const primeiraColuna = new Date(Date.UTC(ano, mes - 1, 1)).getUTCDay();
  const diasNoMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate();

  const celulas: (string | null)[] = [
    ...Array<null>(primeiraColuna).fill(null),
    ...Array.from(
      { length: diasNoMes },
      (_, i) => `${mesAtual}-${String(i + 1).padStart(2, "0")}`
    ),
  ];

  return (
    <div className="carta p-4 sm:p-6">
      {/* Cabeçalho do mês */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          aria-label="Mês anterior"
          className="grid h-9 w-9 shrink-0 place-items-center text-texto/60 transition-colors hover:text-realce disabled:cursor-not-allowed disabled:opacity-25"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <p
          aria-live="polite"
          className="versalete font-display text-[1.05rem] text-realce sm:text-[1.2rem]"
        >
          {MESES[mes - 1]} de {ano}
        </p>

        <button
          type="button"
          onClick={() => setIndice((i) => Math.min(meses.length - 1, i + 1))}
          disabled={indice >= meses.length - 1}
          aria-label="Próximo mês"
          className="grid h-9 w-9 shrink-0 place-items-center text-texto/60 transition-colors hover:text-realce disabled:cursor-not-allowed disabled:opacity-25"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Cabeçalho da semana */}
      <div className="grid grid-cols-7 gap-1">
        {SEMANA.map((d) => (
          <div
            key={d}
            aria-hidden
            className="versalete-larga pb-2 text-center text-[0.55rem] text-texto/40"
          >
            {d}
          </div>
        ))}
      </div>

      {/* A grade */}
      <div className="grid grid-cols-7 gap-1">
        {celulas.map((chave, i) => {
          if (!chave) return <div key={`vazio-${i}`} aria-hidden />;

          const info = porDia.get(chave);
          const numero = partes(chave).dia;
          const ehHoje = chave === hoje;
          const ativo = chave === diaAtivo;
          const temVaga = info?.livre ?? false;

          /* Dia sem nada é texto apagado e não é botão — pôr `disabled` em 30
             botões por mês enche a navegação por teclado de paradas inúteis. */
          if (!info) {
            return (
              <div
                key={chave}
                className={cn(
                  "grid aspect-square place-items-center text-[0.9rem] text-texto/25",
                  ehHoje && "ring-1 ring-inset ring-borda"
                )}
              >
                {numero}
              </div>
            );
          }

          return (
            <button
              key={chave}
              type="button"
              disabled={!temVaga}
              onClick={() => aoEscolher(chave)}
              aria-pressed={ativo}
              aria-label={`${info.diaLongo}${
                temVaga
                  ? `, ${info.vagas} ${info.vagas === 1 ? "vaga" : "vagas"}`
                  : ", esgotado"
              }`}
              style={ativo ? { viewTransitionName: "dia-escolhido" } : undefined}
              className={cn(
                "relative grid aspect-square place-items-center text-[0.95rem]",
                "transition-[background-color,color] duration-[var(--t-toque)] ease-[var(--ease-firme)]",
                ativo
                  ? "bg-vermelho font-medium text-branco"
                  : temVaga
                    ? "bg-osso/45 font-medium text-texto hover:bg-osso/75"
                    : "cursor-not-allowed text-texto/30 line-through decoration-1",
                ehHoje && !ativo && "ring-1 ring-inset ring-realce/45"
              )}
            >
              {numero}
              {/* O ponto diz "tem coisa aqui" sem depender só do tingido —
                  daltonismo e telas ruins comem a diferença de fundo. */}
              {temVaga && !ativo ? (
                <span
                  aria-hidden
                  className="absolute bottom-1 h-1 w-1 rounded-full bg-realce"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.72rem] text-texto/50">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 bg-osso/70" />
          tem vaga
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 bg-vermelho" />
          escolhido
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 ring-1 ring-inset ring-realce/45" />
          hoje
        </span>
      </p>
    </div>
  );
}
