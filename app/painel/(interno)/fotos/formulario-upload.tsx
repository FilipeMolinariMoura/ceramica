"use client";

import { useActionState, useRef, useEffect } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subirFoto } from "@/app/painel/acoes-conteudo";

export function FormularioUpload() {
  const [estado, acao, pendente] = useActionState(subirFoto, null);
  const form = useRef<HTMLFormElement>(null);

  // Limpa depois de subir, senão a mesma foto é reenviada no próximo clique.
  useEffect(() => {
    if (estado?.ok) form.current?.reset();
  }, [estado]);

  return (
    <form
      ref={form}
      action={acao}
      className="grid gap-4 border border-linha bg-branco p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
    >
      <div className="grid gap-2">
        <Label htmlFor="arquivo">Foto</Label>
        <input
          id="arquivo"
          name="arquivo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          className="h-12 w-full border border-linha bg-branco px-3 py-2.5 text-[0.85rem] file:mr-3 file:border-0 file:bg-vermelho file:px-3 file:py-1.5 file:text-[0.7rem] file:font-semibold file:uppercase file:tracking-[0.1em] file:text-branco"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="alt">O que aparece na foto</Label>
        <Input
          id="alt"
          name="alt"
          placeholder="Tigela de grés esmaltada em verde, sobre a mesa"
          required
        />
      </div>

      <Button type="submit" disabled={pendente} className="h-12">
        {pendente ? "Subindo…" : "Subir"}
      </Button>

      {estado?.erro ? (
        <p role="alert" className="text-[0.85rem] text-vermelho sm:col-span-3">
          {estado.erro}
        </p>
      ) : null}

      <p className="text-[0.78rem] leading-relaxed text-grafite/65 sm:col-span-3">
        JPG, PNG, WebP ou AVIF, até 12 MB. A foto é reduzida e reconvertida
        automaticamente — e os dados de GPS que o celular grava nela são
        descartados no caminho.
      </p>
    </form>
  );
}
