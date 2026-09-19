"use client";

import { useActionState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { entrar } from "@/app/painel/acoes";

export function FormularioEntrar({ de }: { de?: string }) {
  const [estado, acao, pendente] = useActionState(entrar, null);

  return (
    <form action={acao} className="mt-8 grid gap-4 border border-linha bg-branco p-6">
      <input type="hidden" name="de" value={de ?? "/painel"} />

      <div className="grid gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {estado?.erro ? (
        <p role="alert" className="text-[0.85rem] text-vermelho">
          {estado.erro}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pendente} className="mt-1 w-full">
        {pendente ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
