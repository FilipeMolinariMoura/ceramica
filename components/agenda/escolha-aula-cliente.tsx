"use client";

import * as React from "react";
import { Check, MessageCircle, Palette, Flame, Hand } from "lucide-react";
import { InscricaoCta } from "@/components/inscricao-cta";
import { FormularioPagamento, type Pedido } from "@/components/agenda/formulario-pagamento";
import { TURMAS, WHATSAPP_DUVIDA, type TurmaId } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Escolher → pagar, sem ler.
 *
 * Três toques até o botão de pagar: o PLANO (mensal ou avulsa), a TURMA
 * (manhã ou tarde) e a DATA. Tudo o que a pessoa precisa para decidir está
 * nas próprias opções — preço por aula, economia, lugares livres —, e não em
 * parágrafo nenhum. Quem quiser detalhe tem a página inteira embaixo.
 *
 * A mensal vem primeiro e pré-selecionada: é a que vale mais para quem
 * compra e para o ateliê, e o preço por aula dela só funciona como argumento
 * se for a primeira coisa que o olho compara.
 *
 * Todo o trabalho de fuso já foi feito no servidor: cada data chega aqui com
 * o rótulo pronto. O cliente NÃO recebe `Date` nem formata data.
 */

export type SlotVisivel = {
  id: number;
  chave: string;
  /** "ter" */
  dia: string;
  /** "06/10" */
  data: string;
  /** "terça-feira, 6 de outubro" */
  diaLongo: string;
  /** "10h" */
  hora: string;
  turma: TurmaId | null;
  restantes: number;
  vagas: number;
};

export type PacoteVisivel = {
  inicioId: number;
  ids: number[];
  datas: string[];
  inicioLongo: string;
  restantes: number[];
  vagas: number[];
  disponivel: boolean;
};

export type PrecosVisiveis = {
  avulsa: string;
  duracaoMin: number;
  mensal: {
    aulas: number;
    pix: string;
    cartao: string;
    porAula: string;
    economia: string;
    pct: number;
    cartaoDifere: boolean;
  } | null;
};

type Plano = "mensal" | "avulsa";
type Aba = TurmaId | "outros";

type Props = {
  slots: SlotVisivel[];
  pacotes: Record<TurmaId, PacoteVisivel[]>;
  precos: PrecosVisiveis;
  inicial: { plano?: Plano; turma?: TurmaId; horarioId?: number };
  origem?: string;
  /** h1 quando a escolha abre a página; h2 quando é um bloco no meio dela. */
  titulo?: "h1" | "h2";
};

export function EscolhaAulaCliente({
  slots,
  pacotes,
  precos,
  inicial,
  origem,
  titulo: Titulo = "h1",
}: Props) {
  const temMensal = precos.mensal !== null;
  const deepLink = inicial.horarioId
    ? slots.find((s) => s.id === inicial.horarioId && s.restantes > 0)
    : undefined;

  const [plano, setPlano] = React.useState<Plano>(() =>
    deepLink ? "avulsa" : !temMensal ? "avulsa" : (inicial.plano ?? "mensal")
  );

  // A turma abre na que tem o que vender: a pedida, senão a primeira com
  // pacote disponível, senão a manhã.
  const [aba, setAba] = React.useState<Aba>(() => {
    if (deepLink) return deepLink.turma ?? "outros";
    if (inicial.turma) return inicial.turma;
    return TURMAS.find((t) => pacotes[t.id].some((p) => p.disponivel))?.id ?? "manha";
  });

  const [slotId, setSlotId] = React.useState<number | null>(deepLink?.id ?? null);
  const [inicioId, setInicioId] = React.useState<number | null>(null);
  const [pedido, setPedido] = React.useState<Pedido | null>(null);

  const temOutros = slots.some((s) => s.turma === null);
  const turma: TurmaId = aba === "outros" ? "manha" : aba;

  // Na mensal não existe "outros": horário fora das turmas não entra em pacote.
  React.useEffect(() => {
    if (plano === "mensal" && aba === "outros") setAba("manha");
  }, [plano, aba]);

  const slotsDaAba = slots.filter((s) => (aba === "outros" ? s.turma === null : s.turma === aba));
  const pacotesDaTurma = pacotes[turma] ?? [];

  // Seleção padrão: a primeira data com lugar. Recalculada quando a turma ou
  // o plano mudam e a seleção atual deixa de pertencer à lista.
  const slot =
    slotsDaAba.find((s) => s.id === slotId && s.restantes > 0) ??
    slotsDaAba.find((s) => s.restantes > 0) ??
    null;
  const pacote =
    pacotesDaTurma.find((p) => p.inicioId === inicioId && p.disponivel) ??
    pacotesDaTurma.find((p) => p.disponivel) ??
    null;

  // O link da home para um horário abre o formulário direto — a pessoa já
  // escolheu a data lá, e mostrar a escolha de novo seria pedir o clique duas
  // vezes.
  React.useEffect(() => {
    if (deepLink) {
      setPedido({
        tipo: "avulsa",
        horarioId: deepLink.id,
        titulo: "Aula avulsa",
        resumo: `${deepLink.diaLongo}, às ${deepLink.hora}`,
        preco: precos.avulsa,
      });
    }
    // Só na montagem: o deep link vale para a chegada, não para cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A barra de resumo fica presa ao pé da tela no celular; enquanto ela
  // aparece, o botão flutuante do WhatsApp sobe para não ficar por cima.
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) document.body.dataset.barraFixa = "1";
      else delete document.body.dataset.barraFixa;
    });
    obs.observe(el);
    return () => {
      obs.disconnect();
      delete document.body.dataset.barraFixa;
    };
  }, []);

  const periodo = TURMAS.find((t) => t.id === turma)!;

  function continuar() {
    if (plano === "avulsa" && slot) {
      setPedido({
        tipo: "avulsa",
        horarioId: slot.id,
        titulo: "Aula avulsa",
        resumo: `${slot.diaLongo}, às ${slot.hora}`,
        preco: precos.avulsa,
      });
    } else if (plano === "mensal" && pacote && precos.mensal) {
      setPedido({
        tipo: "mensal",
        turma,
        inicioId: pacote.inicioId,
        horarioIds: pacote.ids,
        titulo: `Turma da ${periodo.periodo.toLowerCase()} · ${periodo.horario}`,
        resumo: `${pacote.datas.length} terças: ${pacote.datas.join(", ")}`,
        pix: precos.mensal.pix,
        cartao: precos.mensal.cartao,
        cartaoDifere: precos.mensal.cartaoDifere,
      });
    }
  }

  const semNada = slots.length === 0;

  return (
    <div ref={ref} className="flex flex-col gap-8">
      <header className="flex flex-col gap-3" data-enter>
        <p className="rotulo">Terças · {TURMAS.map((t) => t.horario.split(" ")[0]).join(" ou ")} · Pinheiros</p>
        <Titulo className="titulo-hero versalete font-display text-vermelho">Mão no barro</Titulo>
      </header>

      {/* ── 1. O plano ─────────────────────────────────────────────────── */}
      <div role="radiogroup" aria-label="Como você quer começar" className="grid gap-3 sm:grid-cols-2">
        {precos.mensal ? (
          <CartaoPlano
            ativo={plano === "mensal"}
            aoEscolher={() => setPlano("mensal")}
            destaque={`Melhor valor · −${precos.mensal.pct}%`}
            titulo="Turma mensal"
            preco={precos.mensal.porAula}
            riscado={precos.avulsa}
            linha={`${precos.mensal.aulas} terças · ${precos.mensal.pix} no Pix`}
            selo={`economize ${precos.mensal.economia}`}
          />
        ) : null}
        <CartaoPlano
          ativo={plano === "avulsa"}
          aoEscolher={() => setPlano("avulsa")}
          titulo="Aula avulsa"
          preco={precos.avulsa}
          linha="1 terça · sem compromisso"
        />
      </div>

      {semNada ? (
        <SemHorarios />
      ) : (
        <>
          {/* ── 2. A turma ───────────────────────────────────────────────── */}
          <div role="tablist" aria-label="Turma" className="grid grid-cols-2 gap-px border border-borda bg-borda sm:inline-grid sm:auto-cols-fr sm:grid-flow-col sm:self-start">
            {TURMAS.map((t) => {
              const livres =
                plano === "mensal"
                  ? (pacotes[t.id].find((p) => p.disponivel)?.restantes[0] ?? 0)
                  : (slots.find((s) => s.turma === t.id && s.restantes > 0)?.restantes ?? 0);
              return (
                <AbaTurma
                  key={t.id}
                  ativa={aba === t.id}
                  aoEscolher={() => setAba(t.id)}
                  titulo={t.periodo}
                  sub={t.horario}
                  livres={livres}
                />
              );
            })}
            {plano === "avulsa" && temOutros ? (
              <AbaTurma
                ativa={aba === "outros"}
                aoEscolher={() => setAba("outros")}
                titulo="Outros"
                sub="horários extras"
                livres={slots.find((s) => s.turma === null && s.restantes > 0)?.restantes ?? 0}
              />
            ) : null}
          </div>

          {/* ── 3. A data ────────────────────────────────────────────────── */}
          {plano === "avulsa" ? (
            <Regua vazia={slotsDaAba.length === 0}>
              {slotsDaAba.map((s, i) => (
                <ChipData
                  key={s.id}
                  i={i}
                  ativo={slot?.id === s.id}
                  esgotado={s.restantes <= 0}
                  aoEscolher={() => setSlotId(s.id)}
                  topo={aba === "outros" ? `${s.dia} · ${s.hora}` : s.dia}
                  data={s.data}
                  restantes={s.restantes}
                  vagas={s.vagas}
                />
              ))}
            </Regua>
          ) : pacote ? (
            <div className="flex flex-col gap-4">
              <Regua vazia={false} rotulo="Começa em">
                {pacotesDaTurma.map((p, i) => (
                  <ChipData
                    key={p.inicioId}
                    i={i}
                    ativo={pacote.inicioId === p.inicioId}
                    esgotado={!p.disponivel}
                    aoEscolher={() => setInicioId(p.inicioId)}
                    topo="ter"
                    data={p.datas[0]!}
                    restantes={Math.min(...p.restantes)}
                    vagas={p.vagas[0] ?? 6}
                  />
                ))}
              </Regua>
              <LinhaDoPacote pacote={pacote} />
            </div>
          ) : (
            <ListaDeEspera turma={periodo.periodo.toLowerCase()} />
          )}
        </>
      )}

      {/* ── 4. Resumo e botão ───────────────────────────────────────────── */}
      {!semNada && (plano === "avulsa" ? slot : pacote) ? (
        <div className="sticky bottom-0 z-30 -mx-6 border-t border-borda bg-papel/95 px-6 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <div className="flex items-center justify-between gap-4 sm:justify-start sm:gap-6">
            <p className="flex min-w-0 flex-col text-[0.8rem] leading-snug text-texto/70 sm:order-2 sm:flex-row sm:gap-2 sm:text-[0.85rem]">
              {plano === "avulsa" && slot ? (
                <>
                  <strong className="whitespace-nowrap font-semibold text-texto">
                    {slot.dia} {slot.data} · {slot.hora}
                  </strong>
                  <span className="whitespace-nowrap">{precos.avulsa}</span>
                </>
              ) : pacote && precos.mensal ? (
                <>
                  <strong className="whitespace-nowrap font-semibold text-texto">
                    {pacote.datas[0]} → {pacote.datas.at(-1)} · {periodo.horario.split(" ")[0]}
                  </strong>
                  <span className="whitespace-nowrap">
                    {precos.mensal.pix} · {precos.mensal.porAula}/aula
                  </span>
                </>
              ) : null}
            </p>
            <button
              type="button"
              onClick={continuar}
              className="h-[3.1rem] shrink-0 bg-vermelho px-6 text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-branco transition-[background-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:bg-vermelho-escuro active:translate-y-px sm:order-1 sm:px-10"
            >
              {plano === "mensal" ? (
                <>
                  <span className="sm:hidden">Garantir</span>
                  <span className="hidden sm:inline">Garantir minhas terças</span>
                </>
              ) : (
                "Reservar"
              )}
            </button>
          </div>
        </div>
      ) : null}

      {/* O que vale para qualquer escolha — três ícones, não um parágrafo. */}
      <ul className="grid grid-cols-3 gap-2 text-center text-[0.75rem] leading-snug text-texto/65 sm:max-w-xl">
        {[
          [Hand, "Sem experiência"],
          [Palette, "Ferramentas inclusas"],
          [Flame, "Queima inclusa"],
        ].map(([Icone, rotulo]) => {
          const I = Icone as typeof Hand;
          return (
            <li key={rotulo as string} className="flex flex-col items-center gap-1.5 py-2">
              <I aria-hidden className="h-5 w-5 text-realce" strokeWidth={1.6} />
              {rotulo as string}
            </li>
          );
        })}
      </ul>

      <a
        href={WHATSAPP_DUVIDA}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 self-start text-[0.82rem] text-texto/60 underline underline-offset-4 transition-colors hover:text-realce"
      >
        <MessageCircle aria-hidden className="h-4 w-4" />
        Prefiro falar no WhatsApp
      </a>

      <FormularioPagamento pedido={pedido} origem={origem} aoFechar={() => setPedido(null)} />
    </div>
  );
}

/* ── Peças ──────────────────────────────────────────────────────────────── */

function CartaoPlano({
  ativo,
  aoEscolher,
  destaque,
  titulo,
  preco,
  riscado,
  linha,
  selo,
}: {
  ativo: boolean;
  aoEscolher: () => void;
  destaque?: string;
  titulo: string;
  preco: string;
  riscado?: string;
  linha: string;
  selo?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={ativo}
      onClick={aoEscolher}
      className={cn(
        "group relative flex flex-col items-start gap-1 border-2 bg-superficie p-5 text-left transition-[border-color,box-shadow,translate] duration-[var(--t-estado)] ease-[var(--ease-firme)] active:translate-y-px sm:p-6",
        ativo ? "border-vermelho shadow-lift" : "border-transparent outline outline-1 -outline-offset-1 outline-borda hover:outline-vermelho/50"
      )}
    >
      {destaque ? (
        <span className="versalete-larga absolute -top-3 left-5 bg-vermelho px-2.5 py-1 text-[0.56rem] text-branco sm:left-6">
          {destaque}
        </span>
      ) : null}
      <span
        aria-hidden
        className={cn(
          "absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full border transition-colors duration-[var(--t-estado)]",
          ativo ? "border-vermelho bg-vermelho text-branco" : "border-borda text-transparent"
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>

      <span className="versalete-larga mt-1 text-[0.62rem] text-texto/55">{titulo}</span>
      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="numeral text-[2.6rem] leading-none text-texto sm:text-[3.1rem] lg:text-[2.7rem]">{preco}</span>
        <span className="text-[0.85rem] text-texto/55">/aula</span>
        {riscado ? (
          <span className="numeral text-[1.05rem] text-texto/40 line-through decoration-vermelho/70 decoration-2">
            {riscado}
          </span>
        ) : null}
      </span>
      <span className="text-[0.85rem] text-texto/70">{linha}</span>
      {selo ? (
        <span className="mt-2 bg-verde px-2 py-0.5 text-[0.72rem] font-medium text-branco">{selo}</span>
      ) : null}
    </button>
  );
}

function AbaTurma({
  ativa,
  aoEscolher,
  titulo,
  sub,
  livres,
}: {
  ativa: boolean;
  aoEscolher: () => void;
  titulo: string;
  sub: string;
  livres: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativa}
      onClick={aoEscolher}
      className={cn(
        "flex flex-col items-start gap-0.5 px-5 py-3 text-left transition-colors duration-[var(--t-estado)]",
        ativa ? "bg-preto text-papel" : "bg-superficie text-texto hover:bg-papel"
      )}
    >
      <span className="text-[0.95rem] font-medium">{titulo}</span>
      <span className={cn("text-[0.75rem]", ativa ? "text-papel/70" : "text-texto/55")}>{sub}</span>
      <span className={cn("mt-1 text-[0.68rem]", ativa ? "text-papel/80" : livres > 0 ? "text-realce" : "text-texto/40")}>
        {livres > 0 ? `${livres} ${livres === 1 ? "lugar" : "lugares"} na próxima` : "lotada"}
      </span>
    </button>
  );
}

function Regua({
  children,
  vazia,
  rotulo,
}: {
  children: React.ReactNode;
  vazia: boolean;
  rotulo?: string;
}) {
  if (vazia) {
    return (
      <p className="border border-borda bg-superficie p-6 text-center text-[0.9rem] text-texto/65">
        Sem datas nesta turma agora.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {rotulo ? <span className="versalete-larga text-[0.58rem] text-texto/50">{rotulo}</span> : null}
      <div className="regua-dias -mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:[mask-image:none]">
        {children}
      </div>
    </div>
  );
}

function ChipData({
  i,
  ativo,
  esgotado,
  aoEscolher,
  topo,
  data,
  restantes,
  vagas,
}: {
  i: number;
  ativo: boolean;
  esgotado: boolean;
  aoEscolher: () => void;
  topo: string;
  data: string;
  restantes: number;
  vagas: number;
}) {
  const ultima = restantes === 1 && !esgotado;
  return (
    <button
      type="button"
      disabled={esgotado}
      aria-pressed={ativo}
      onClick={aoEscolher}
      style={{ "--i": i } as React.CSSProperties}
      className={cn(
        "flex w-[5.6rem] shrink-0 flex-col items-center gap-1.5 border px-2 pb-2.5 pt-2 transition-[background-color,border-color,color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] active:translate-y-px",
        ativo
          ? "border-vermelho bg-vermelho text-branco"
          : esgotado
            ? "cursor-not-allowed border-borda bg-transparent text-texto/35"
            : "border-borda bg-superficie text-texto hover:border-vermelho"
      )}
    >
      <span className={cn("versalete-larga text-[0.55rem]", ativo ? "text-branco/80" : "text-texto/50")}>{topo}</span>
      <span className={cn("numeral text-[1.3rem] leading-none", esgotado && "line-through decoration-1")}>{data}</span>
      <Lugares vagas={vagas} restantes={restantes} claro={ativo} />
      <span
        className={cn(
          "text-[0.62rem] leading-none",
          ativo ? "text-branco" : ultima ? "font-semibold text-realce" : "text-texto/55"
        )}
      >
        {esgotado ? "lotada" : ultima ? "última vaga" : `restam ${restantes}`}
      </span>
    </button>
  );
}

/**
 * Um ponto por lugar da mesa: cheio é lugar tomado, vazado é lugar livre. Lê
 * a escassez num relance, sem escrever "restam poucas vagas".
 */
function Lugares({ vagas, restantes, claro }: { vagas: number; restantes: number; claro?: boolean }) {
  const ocupados = Math.max(vagas - restantes, 0);
  return (
    <span className="flex gap-[3px]" aria-hidden>
      {Array.from({ length: Math.min(vagas, 8) }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-[7px] w-[7px] rounded-full",
            i < ocupados
              ? claro
                ? "bg-branco/45"
                : "bg-texto/30"
              : claro
                ? "border border-branco"
                : "border border-realce"
          )}
        />
      ))}
    </span>
  );
}

function LinhaDoPacote({ pacote }: { pacote: PacoteVisivel }) {
  return (
    <ol
      key={pacote.inicioId}
      data-lista-stagger
      className="grid grid-cols-4 border border-borda bg-superficie"
      aria-label="As aulas do pacote"
    >
      {pacote.datas.map((d, i) => (
        <li
          key={d}
          style={{ "--i": i } as React.CSSProperties}
          className="relative flex flex-col items-center gap-1.5 border-r border-borda px-1 py-3 last:border-r-0"
        >
          <span className="numeral text-[0.7rem] text-texto/40">{i + 1}ª</span>
          <span className="numeral text-[1.05rem] leading-none text-texto sm:text-[1.2rem]">{d}</span>
          <Lugares vagas={pacote.vagas[i] ?? 6} restantes={pacote.restantes[i] ?? 0} />
        </li>
      ))}
    </ol>
  );
}

function SemHorarios() {
  return (
    <div className="flex flex-col items-start gap-4 border border-borda bg-superficie p-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-display text-xl text-texto">Agenda fechada por enquanto.</p>
      <a
        href={WHATSAPP_DUVIDA}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 items-center gap-2 bg-vermelho px-6 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-branco transition-colors hover:bg-vermelho-escuro"
      >
        <MessageCircle aria-hidden className="h-4 w-4" />
        Pedir um horário
      </a>
    </div>
  );
}

function ListaDeEspera({ turma }: { turma: string }) {
  return (
    <div className="flex flex-col items-start gap-4 border border-borda bg-superficie p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-display text-xl text-texto">Turma da {turma} completa.</p>
        <p className="mt-1 text-[0.85rem] text-texto/60">Entre na lista e receba o aviso primeiro.</p>
      </div>
      <InscricaoCta origem="aulas-lista" label="Entrar na lista" size="md" />
    </div>
  );
}
