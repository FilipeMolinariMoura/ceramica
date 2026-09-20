"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskPhone } from "@/lib/utils";
import { WHATSAPP_OFICINA } from "@/lib/constants";

/**
 * Briefing da oficina.
 *
 * Oficina não tem preço de tabela — depende de quantas pessoas, onde e quando.
 * Então este formulário não cobra nada: ele coleta o suficiente para a Isabela
 * responder com um número, e manda a pessoa para o WhatsApp, que é onde a
 * conversa fecha de verdade.
 *
 * O envio é `keepalive` e o erro de banco NÃO bloqueia: o pedido seguir para o
 * WhatsApp importa mais que o registro, e o banco fora do ar não pode virar
 * orçamento perdido. Mesma decisão de `app/api/inscricao/route.ts`.
 */
export function FormularioOficina() {
  const [enviado, setEnviado] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const [whatsapp, setWhatsapp] = React.useState("");

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviando) return;

    const dados = Object.fromEntries(new FormData(e.currentTarget));
    const nome = String(dados.nome ?? "").trim();
    const email = String(dados.email ?? "").trim();

    if (nome.length < 2) return toast.error("Escreva seu nome.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      return toast.error("Confira o e-mail.");
    if (whatsapp.replace(/\D/g, "").length < 10)
      return toast.error("Confira o WhatsApp com DDD.");

    setEnviando(true);
    try {
      await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ ...dados, whatsapp, tipo: "oficina", origem: "oficinas" }),
      });
    } catch {
      // Ver o comentário do componente: falha aqui não interrompe nada.
    }
    setEnviando(false);
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="border border-linha bg-branco p-8 text-center">
        <h3 className="versalete font-display text-2xl text-vermelho">
          Pedido recebido
        </h3>
        <p className="mx-auto mt-3 max-w-sm text-[0.95rem] leading-relaxed text-grafite">
          A Isabela responde com o orçamento em até dois dias úteis. Se for
          urgente, chame direto no WhatsApp.
        </p>
        <a
          href={WHATSAPP_OFICINA}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-12 items-center justify-center bg-vermelho px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-branco transition-[background-color,color,border-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] active:translate-y-px hover:bg-vermelho-escuro"
        >
          Abrir o WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={enviar}
      noValidate
      className="grid gap-4 border border-linha bg-branco p-6 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="o-nome">Nome</Label>
          <Input id="o-nome" name="nome" autoComplete="name" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="o-email">E-mail</Label>
          <Input id="o-email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="o-zap">WhatsApp</Label>
          <Input
            id="o-zap"
            name="whatsapp"
            inputMode="tel"
            autoComplete="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="o-ocasiao">Ocasião</Label>
          <Input id="o-ocasiao" name="ocasiao" placeholder="Aniversário, time, bodas…" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="o-pessoas">Quantas pessoas</Label>
          <Input id="o-pessoas" name="pessoas" inputMode="numeric" placeholder="10" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="o-quando">Quando</Label>
          <Input id="o-quando" name="quando" placeholder="Meados de outubro" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="o-local">Onde</Label>
        <Input id="o-local" name="local" placeholder="No ateliê, ou endereço do evento" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="o-msg">O que você tem em mente</Label>
        <textarea
          id="o-msg"
          name="mensagem"
          rows={4}
          className="w-full rounded-none border border-linha bg-branco px-4 py-3 text-[0.95rem] text-preto outline-none transition-colors placeholder:text-preto/35 focus-visible:border-vermelho focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermelho"
          placeholder="Conte o clima do evento e o que gostaria que as pessoas levassem para casa."
        />
      </div>

      {/* honeypot anti-bot — escondido de gente, tentador para robôs */}
      <div aria-hidden className="pointer-events-none absolute -left-[9999px]">
        <input name="empresa" tabIndex={-1} autoComplete="off" />
      </div>

      <Button type="submit" size="lg" disabled={enviando} className="mt-1 w-full sm:w-auto">
        {enviando ? "Enviando…" : "Pedir orçamento"}
      </Button>
    </form>
  );
}
