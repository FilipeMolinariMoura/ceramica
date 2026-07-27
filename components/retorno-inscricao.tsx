"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { whatsappInscricao, type TurmaValor } from "@/lib/constants";

const CHAVE = "ceramica:lead";
const VALIDADE = 6 * 60 * 60 * 1000; // 6h

type Lead = {
  nome?: string;
  turma?: TurmaValor;
  at?: number;
  confirmado?: boolean;
};

function lerLead(): Lead | null {
  try {
    const raw = localStorage.getItem(CHAVE);
    return raw ? (JSON.parse(raw) as Lead) : null;
  } catch {
    return null;
  }
}

/**
 * Mensagem de "seu interesse ficou salvo". Aparece quando a pessoa se inscreve
 * e volta do WhatsApp: guardamos o lead em localStorage e reagimos ao retorno
 * (evento próprio, foco na aba ou navegação de volta).
 */
export function RetornoInscricao() {
  const [aberto, setAberto] = React.useState(false);
  const [lead, setLead] = React.useState<Lead | null>(null);

  const abrirSePendente = React.useCallback(() => {
    const l = lerLead();
    if (!l || l.confirmado) return;
    if (typeof l.at === "number" && Date.now() - l.at > VALIDADE) return;
    setLead(l);
    setAberto(true);
  }, []);

  React.useEffect(() => {
    abrirSePendente();
    const onInscrito = () => abrirSePendente();
    const onPageShow = () => abrirSePendente();
    const onVisibility = () => {
      if (document.visibilityState === "visible") abrirSePendente();
    };
    window.addEventListener("ceramica:inscrito", onInscrito);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("ceramica:inscrito", onInscrito);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [abrirSePendente]);

  function onOpenChange(v: boolean) {
    setAberto(v);
    if (!v) {
      // Marca como confirmado para não reaparecer nas próximas visitas.
      const l = lerLead();
      try {
        localStorage.setItem(
          CHAVE,
          JSON.stringify({ ...(l ?? {}), confirmado: true })
        );
      } catch {
        // localStorage indisponível — tudo bem
      }
    }
  }

  const primeiroNome = lead?.nome?.trim().split(/\s+/)[0];
  const link = whatsappInscricao(lead?.nome ?? "", lead?.turma);

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="text-center">
        <DialogHeader className="items-center gap-3">
          <span
            aria-hidden
            className="grid h-16 w-16 place-items-center rounded-full bg-cobalto text-lona-100 shadow-[0_14px_30px_-16px_rgba(29,79,160,0.85)]"
          >
            <Check className="h-8 w-8" strokeWidth={2.4} />
          </span>
          <DialogTitle>
            {primeiroNome ? `Pronto, ${primeiroNome}!` : "Pronto!"} Seu interesse
            ficou salvo
          </DialogTitle>
          <DialogDescription>
            A Isabela recebeu seus dados e vai te chamar no WhatsApp para
            confirmar a vaga e tirar qualquer dúvida. É só ficar de olho na
            conversa por lá.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Button
            variant="cobalto"
            size="lg"
            className="w-full"
            onClick={() => window.open(link, "_blank", "noopener,noreferrer")}
          >
            Abrir o WhatsApp de novo
          </Button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mx-auto py-1 text-sm text-barro/60 transition-colors hover:text-barro"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
