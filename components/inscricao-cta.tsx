"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EXPERIENCIA_OPCOES,
  TURMA_OPCOES,
  whatsappInscricao,
  type ExperienciaValor,
  type TurmaValor,
} from "@/lib/constants";
import { maskPhone, onlyDigits } from "@/lib/utils";

type Props = {
  label?: string;
  origem: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
};

export function InscricaoCta({
  label = "Quero minha vaga",
  origem,
  variant = "cobalto",
  size = "lg",
  className,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [nome, setNome] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [turma, setTurma] = React.useState<TurmaValor | "">("");
  const [experiencia, setExperiencia] = React.useState<ExperienciaValor | "">("");
  const [honeypot, setHoneypot] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim()) {
      toast.error("Como você se chama?");
      return;
    }
    const digits = onlyDigits(whatsapp);
    if (digits.length < 10 || digits.length > 11) {
      toast.error("Confere o WhatsApp com DDD, por favor.");
      return;
    }
    if (!turma) {
      toast.error("Escolha o horário: manhã ou tarde.");
      return;
    }
    if (!experiencia) {
      toast.error("Escolha uma opção de experiência.");
      return;
    }

    setEnviando(true);

    // Grava no Supabase — mas o lead nunca se perde: com sucesso ou falha,
    // a pessoa é levada ao WhatsApp mesmo assim.
    try {
      await fetch("/api/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          whatsapp,
          turma,
          experiencia,
          origem,
          empresa: honeypot, // honeypot
        }),
        keepalive: true,
      });
    } catch {
      // silencioso de propósito — segue pro WhatsApp
    }

    window.location.href = whatsappInscricao(nome, turma);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {label}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reservar minha vaga</DialogTitle>
          <DialogDescription>
            Seis vagas por turma. Preencha e eu te respondo pelo WhatsApp para
            confirmar tudo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              name="nome"
              autoComplete="name"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="turma">Qual horário? (terças)</Label>
            <Select
              value={turma}
              onValueChange={(v) => setTurma(v as TurmaValor)}
            >
              <SelectTrigger id="turma" aria-label="Qual horário da turma?">
                <SelectValue placeholder="Manhã ou tarde" />
              </SelectTrigger>
              <SelectContent>
                {TURMA_OPCOES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="experiencia">Já teve contato com cerâmica?</Label>
            <Select
              value={experiencia}
              onValueChange={(v) => setExperiencia(v as ExperienciaValor)}
            >
              <SelectTrigger id="experiencia" aria-label="Já teve contato com cerâmica?">
                <SelectValue placeholder="Escolha uma opção" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCIA_OPCOES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* honeypot anti-bot — escondido de gente, tentador para robôs */}
          <div className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden>
            <label htmlFor="empresa">Não preencha este campo</label>
            <input
              id="empresa"
              name="empresa"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            variant="cobalto"
            size="lg"
            disabled={enviando}
            className="mt-1 w-full"
          >
            {enviando ? "Abrindo o WhatsApp…" : "Continuar no WhatsApp"}
          </Button>
          <p className="text-center text-[0.78rem] leading-relaxed text-barro/50">
            Ao continuar, você abre uma conversa com a Isabela no WhatsApp.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
