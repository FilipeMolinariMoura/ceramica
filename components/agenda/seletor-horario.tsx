"use client";

import * as React from "react";
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
      if (h.restantes <= 0) continue;
      const lista = por.get(h.dia) ?? [];
      lista.push(h);
      por.set(h.dia, lista);
    }
    return [...por.entries()].map(([dia, lista]) => ({ dia, lista }));
  }, [horarios]);

  const [diaAtivo, setDiaAtivo] = React.useState(() => dias[0]?.dia ?? "");
  const [escolhido, setEscolhido] = React.useState<HorarioVisivel | null>(null);

  const doDia = dias.find((d) => d.dia === diaAtivo)?.lista ?? [];

  if (dias.length === 0) {
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
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dias.map(({ dia, lista }) => {
            const ativo = dia === diaAtivo;
            const primeiro = lista[0]!;
            const vagas = lista.reduce((s, h) => s + h.restantes, 0);
            return (
              <button
                key={dia}
                type="button"
                onClick={() => setDiaAtivo(dia)}
                aria-pressed={ativo}
                className={cn(
                  "flex shrink-0 flex-col items-start gap-0.5 border px-4 py-3 text-left transition-colors",
                  ativo
                    ? "border-vermelho bg-vermelho text-branco"
                    : "border-linha bg-branco text-preto hover:border-vermelho"
                )}
              >
                <span className="versalete-larga text-[0.6rem] opacity-75">
                  {primeiro.diaLongo.split(",")[0]}
                </span>
                <span className="font-display text-lg leading-none">
                  {primeiro.diaCurto}
                </span>
                <span className="text-[0.68rem] opacity-75">
                  {vagas} {vagas === 1 ? "vaga" : "vagas"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Horas do dia escolhido */}
      <div>
        <p className="versalete-larga mb-3 text-[0.68rem] text-preto/50">
          Escolha o horário
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {doDia.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setEscolhido(h)}
              className="group flex flex-col items-start gap-1 border border-linha bg-branco px-4 py-3 text-left transition-colors hover:border-vermelho hover:bg-vermelho hover:text-branco"
            >
              <span className="font-display text-xl leading-none">{h.hora}</span>
              <span className="text-[0.7rem] opacity-70">
                {h.restantes} {h.restantes === 1 ? "vaga" : "vagas"} · {duracaoMin} min
              </span>
            </button>
          ))}
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

          <Button type="submit" size="lg" disabled={enviando} className="mt-1 w-full">
            {enviando ? "Abrindo o pagamento…" : `Pagar ${precoFormatado}`}
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
