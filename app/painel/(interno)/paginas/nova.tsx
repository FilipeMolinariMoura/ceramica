"use client";

import { useActionState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { criarPagina } from "@/app/painel/acoes-conteudo";

export function NovaPagina() {
  const [estado, acao, pendente] = useActionState(criarPagina, null);

  return (
    <form
      action={acao}
      className="grid gap-4 border border-linha bg-branco p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
    >
      <div className="grid gap-2">
        <Label htmlFor="titulo">Título da página</Label>
        <Input id="titulo" name="titulo" placeholder="Workshop de Natal" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">Endereço</Label>
        <Input
          id="slug"
          name="slug"
          placeholder="workshop-de-natal"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          required
        />
      </div>
      <Button type="submit" disabled={pendente} className="h-12">
        {pendente ? "Criando…" : "Criar"}
      </Button>

      {estado?.erro ? (
        <p role="alert" className="text-[0.85rem] text-vermelho sm:col-span-3">
          {estado.erro}
        </p>
      ) : null}
      <p className="text-[0.78rem] text-grafite/65 sm:col-span-3">
        O endereço vira o link: <code>belaceramica.prismax.tech/o-que-voce-escrever</code>.
        Só letras minúsculas, números e hífen.
      </p>
    </form>
  );
}
