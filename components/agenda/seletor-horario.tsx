"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, maskPhone } from "@/lib/utils";

/**
 * Escolher dia → escolher hora → preencher → pagar.
 *
 * Todo o trabalho de fuso já foi feito no servidor: cada horário chega aqui
 * com o rótulo pronto. O cliente NÃO recebe `Date` nem formata data — se
 * formatasse, o horário mudaria conforme o relógio de quem abre a página, e
 * uma aluna em viagem veria a aula das 9h30 como outra coisa.
 */

export type HorarioVisivel = {
  id: number;
  /** Chave do dia (`2026-09-22`), só para agrupar. */
  dia: string;
  /** "terça-feira, 22 de setembro" */
  diaLongo: string;
  /** "22/09" */
  diaCurto: string;
  /** "09:30" */
  hora: string;
  /** "setembro" — a régua separa os meses. */
  mes: string;
  restantes: number;
};

type Props = {
  horarios: HorarioVisivel[];
  precoFormatado: string;
  duracaoMin: number;
};

export function SeletorHorario({ horarios, precoFormatado, duracaoMin }: Props) {
  const dias = React.useMemo(() => {
    const por = new Map<string, HorarioVisivel[]>();
    for (const h of horarios) {
      const lista = por.get(h.dia) ?? [];
      lista.push(h);
      por.set(h.dia, lista);
    }
    // O dia esgotado FICA na régua, cinza e sem clique. Tirá-lo fazia a
    // agenda parecer vazia de procura; mostrá-lo é o que dá valor ao dia que
    // ainda tem vaga. Mesma decisão do horário esgotado.
    return [...por.entries()].map(([dia, lista]) => ({
      dia,
      lista,
      livre: lista.some((h) => h.restantes > 0),
    }));
  }, [horarios]);

  // Abre no primeiro dia COM VAGA, não no primeiro da régua: se a próxima
  // terça está lotada, abrir nela mostra uma tela sem nada para clicar.
  const [diaAtivo, setDiaAtivo] = React.useState(
    () => dias.find((d) => d.livre)?.dia ?? dias[0]?.dia ?? ""
  );
  const [escolhido, setEscolhido] = React.useState<HorarioVisivel | null>(null);

  /**
   * A troca de dia passa pela View Transitions API para o preenchimento
   * vermelho DESLIZAR entre os chips em vez de piscar de um para o outro.
   *
   * `flushSync` é obrigatório: `startViewTransition` fotografa o DOM ao fim do
   * callback, e uma atualização de estado do React é assíncrona por padrão —
   * sem ele o navegador fotografaria a tela antes da mudança e não haveria
   * transição nenhuma. Sem suporte à API, a troca é instantânea, que é
   * exatamente o que já acontecia.
   */
  function escolherDia(dia: string) {
    const podeTransicionar =
      typeof document !== "undefined" &&
      typeof document.startViewTransition === "function" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!podeTransicionar) {
      setDiaAtivo(dia);
      return;
    }
    document.startViewTransition(() => flushSync(() => setDiaAtivo(dia)));
  }

  const doDia = dias.find((d) => d.dia === diaAtivo)?.lista ?? [];

  if (!dias.some((d) => d.livre)) {
    return (
      <div className="border border-linha bg-branco p-8 text-center">
        <p className="font-display text-xl text-preto">
          Sem horários abertos no momento.
        </p>
        <p className="mt-2 text-[0.95rem] text-grafite/80">
          Chame no WhatsApp que a Isabela abre um horário para você.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Dias */}
      <div>
        <p className="versalete-larga mb-3 text-[0.68rem] text-preto/50">
          Escolha o dia
        </p>
        {/* A régua rola na horizontal e são dez dias. Sem sinal nenhum, o
            último chip parece cortado por defeito. A máscara esmaece a borda
            direita e diz "tem mais aqui" sem gastar uma seta. */}
        <div className="regua-dias flex items-stretch gap-2 overflow-x-auto pb-1">
          {dias.map(({ dia, lista, livre }, i) => {
            const ativo = dia === diaAtivo;
            const primeiro = lista[0]!;
            const vagas = lista.reduce((s, h) => s + h.restantes, 0);
            // Rótulo de mês na virada. Dez dias cobrindo setembro e outubro
            // sem isto viram "22/09, 24/09, 29/09, 01/10" — e a pessoa não
            // percebe que atravessou o mês.
            const viraMes = i === 0 || lista[0]!.mes !== dias[i - 1]!.lista[0]!.mes;

            return (
              <React.Fragment key={dia}>
                {viraMes ? (
                  <span
                    aria-hidden
                    className="versalete-larga flex shrink-0 items-end pb-1 pr-1 text-[0.58rem] text-preto/40"
                  >
                    {primeiro.mes}
                  </span>
                ) : null}

                <button
                  type="button"
                  disabled={!livre}
                  onClick={() => escolherDia(dia)}
                  aria-pressed={ativo}
                  aria-label={`${primeiro.diaLongo}${livre ? `, ${vagas} vagas` : ", esgotado"}`}
                  style={ativo ? { viewTransitionName: "dia-escolhido" } : undefined}
                  className={cn(
                    "flex shrink-0 flex-col items-start gap-0.5 border px-4 py-3 text-left",
                    "transition-[background-color,border-color,color] duration-[var(--t-toque)] ease-[var(--ease-firme)]",
                    !livre
                      ? "cursor-not-allowed border-linha bg-papel text-preto/40"
                      : ativo
                        ? "border-vermelho bg-vermelho text-branco"
                        : "border-linha bg-branco text-preto hover:border-vermelho active:translate-y-px"
                  )}
                >
                  <span className="versalete-larga text-[0.6rem] opacity-75">
                    {primeiro.diaLongo.split(",")[0]}
                  </span>
                  <span
                    className={cn(
                      "font-display text-lg leading-none",
                      !livre && "line-through decoration-1"
                    )}
                  >
                    {primeiro.diaCurto}
                  </span>
                  <span className="text-[0.68rem] opacity-75">
                    {livre ? `${vagas} ${vagas === 1 ? "vaga" : "vagas"}` : "esgotado"}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Horas do dia escolhido */}
      <div>
        <p className="rotulo mb-1.5">Escolha o horário</p>
        {/* O chip mostra só "22/09". Quem chega direto na agenda precisa ler
            o dia por extenso antes de pagar por ele. */}
        <p className="mb-4 text-[0.95rem] text-texto/70">
          {doDia[0]?.diaLongo ?? ""}
        </p>

        {/* CARTA, e não caixinha.
            A versão anterior era uma grade de retângulos iguais com a hora
            miúda e o preço a meia tela de distância, numa tabela à esquerda.
            Está escrito no projeto da Landgraf, sobre uma seção com o mesmo
            defeito: "oito coisas do mesmo tamanho, com o mesmo peso, são uma
            lista para auditar, não uma carta para escolher".

            Cada horário agora tem as três âncoras que o olho pega antes de
            ler: a HORA em corpo grande, o PREÇO no alto à direita — que é o
            que se procura primeiro ao comparar — e um botão de largura
            inteira no pé, que é alvo de clique de verdade. */}
        <div
          key={diaAtivo}
          data-lista-stagger
          className="grid items-stretch gap-3 sm:grid-cols-2"
        >
          {doDia.map((h, i) => {
            const esgotado = h.restantes <= 0;
            const ultima = h.restantes === 1;

            return (
              <article
                key={h.id}
                style={{ "--i": i } as React.CSSProperties}
                className={cn(
                  "carta flex h-full flex-col p-5",
                  esgotado && "opacity-55"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={cn(
                        "numeral text-[2rem] leading-none text-texto",
                        esgotado && "line-through decoration-1"
                      )}
                    >
                      {h.hora}
                    </p>
                    <p className="mt-1.5 text-[0.8rem] text-texto/55">
                      {duracaoMin} minutos
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="numeral text-[1.4rem] leading-none text-realce">
                      {precoFormatado}
                    </p>
                    <p className="mt-1.5 text-[0.72rem] text-texto/45">
                      por pessoa
                    </p>
                  </div>
                </div>

                {/* Altura fixa, e o botão empurrado para o pé com `mt-auto`.
                    A etiqueta de "última vaga" é mais alta que a linha de
                    texto simples, e sem isso as cartas da mesma fileira
                    terminavam em alturas diferentes — o botão de uma ficava
                    três pixels acima do da outra, que é o tipo de desalinho
                    que se vê sem saber nomear. */}
                <div className="mt-4 flex h-7 items-center">
                  {ultima && !esgotado ? (
                    <span className="versalete-larga bg-vermelho px-2 py-1 text-[0.58rem] text-branco">
                      Última vaga
                    </span>
                  ) : (
                    <span className="text-[0.78rem] text-texto/55">
                      {esgotado ? "Esgotado" : `${h.restantes} vagas`}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={esgotado}
                  onClick={() => setEscolhido(h)}
                  className={cn(
                    "mt-auto h-12 w-full border text-[0.72rem] font-semibold uppercase tracking-[0.14em]",
                    "transition-[background-color,border-color,color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)]",
                    esgotado
                      ? "cursor-not-allowed border-borda text-texto/35"
                      : "border-vermelho text-vermelho hover:bg-vermelho hover:text-branco active:translate-y-px"
                  )}
                >
                  {esgotado ? "Sem vaga" : "Reservar"}
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <FormularioReserva
        horario={escolhido}
        precoFormatado={precoFormatado}
        aoFechar={() => setEscolhido(null)}
      />
    </div>
  );
}

function FormularioReserva({
  horario,
  precoFormatado,
  aoFechar,
}: {
  horario: HorarioVisivel | null;
  precoFormatado: string;
  aoFechar: () => void;
}) {
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [empresa, setEmpresa] = React.useState(""); // honeypot
  const [enviando, setEnviando] = React.useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!horario || enviando) return;

    if (nome.trim().length < 2) return toast.error("Escreva seu nome.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      return toast.error("Confira o e-mail — é para lá que vai o comprovante.");
    if (whatsapp.replace(/\D/g, "").length < 10)
      return toast.error("Confira o WhatsApp com DDD.");

    setEnviando(true);
    try {
      const r = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          horarioId: horario.id,
          nome: nome.trim(),
          email: email.trim(),
          whatsapp,
          empresa,
        }),
      });
      const dados = await r.json();

      if (!r.ok || !dados.ok) {
        toast.error(dados.erro ?? "Não consegui abrir o pagamento.");
        // Vaga tomada por outra pessoa enquanto esta preenchia: a agenda na
        // tela está velha, e insistir no mesmo horário só repetiria o erro.
        if (dados.motivo === "esgotado") setTimeout(() => location.reload(), 1800);
        setEnviando(false);
        return;
      }

      // Navegação de verdade, não window.open: pop-up bloqueado aqui
      // significaria reserva presa esperando um pagamento que não começou.
      location.href = dados.urlPagamento;
    } catch {
      toast.error("Falha de conexão. Tente de novo.");
      setEnviando(false);
    }
  }

  return (
    <Dialog open={horario !== null} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aula avulsa</DialogTitle>
          <DialogDescription>
            {horario
              ? `${horario.diaLongo}, às ${horario.hora} · ${precoFormatado}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="r-nome">Nome</Label>
            <Input
              id="r-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="r-email">E-mail</Label>
            <Input
              id="r-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="r-zap">WhatsApp</Label>
            <Input
              id="r-zap"
              inputMode="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
              autoComplete="tel"
              required
            />
          </div>

          {/* honeypot anti-bot — escondido de gente, tentador para robôs */}
          <div aria-hidden className="pointer-events-none absolute -left-[9999px]">
            <input
              tabIndex={-1}
              autoComplete="off"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={enviando}
            aria-busy={enviando}
            className={cn(
              "relative mt-1 w-full overflow-hidden disabled:opacity-100",
              enviando && "barra-carregando"
            )}
          >
            {enviando ? "Abrindo o pagamento" : `Pagar ${precoFormatado}`}
          </Button>

          <p className="text-center text-[0.75rem] leading-relaxed text-grafite/65">
            Pix ou cartão em até 12x, pela InfinitePay. Sua vaga fica guardada
            por 20 minutos enquanto você paga.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
