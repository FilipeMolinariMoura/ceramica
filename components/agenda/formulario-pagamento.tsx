"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WHATSAPP_NUMBER, type TurmaId } from "@/lib/constants";
import { cn, maskPhone } from "@/lib/utils";

/**
 * Três campos e o botão de pagar.
 *
 * Serve à aula avulsa e ao pacote da mensal. A mensal tem DOIS botões, um por
 * meio de pagamento, porque os preços são diferentes e a InfinitePay não deixa
 * travar o meio no checkout: o botão que a pessoa aperta aqui é o que define
 * o valor do link.
 *
 * O contato fica guardado no navegador. Quem volta para comprar o próximo
 * pacote — ou volta depois de fechar o checkout sem querer — não digita nada
 * de novo.
 */

export type Pedido =
  | {
      tipo: "avulsa";
      horarioId: number;
      titulo: string;
      resumo: string;
      preco: string;
    }
  | {
      tipo: "mensal";
      turma: TurmaId;
      inicioId: number;
      horarioIds: number[];
      titulo: string;
      resumo: string;
      pix: string;
      cartao: string;
      cartaoDifere: boolean;
    };

const CHAVE_CONTATO = "ceramica:contato";

function lerContato(): { nome: string; email: string; whatsapp: string } | null {
  try {
    const bruto = localStorage.getItem(CHAVE_CONTATO);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

function guardarContato(c: { nome: string; email: string; whatsapp: string }) {
  try {
    localStorage.setItem(CHAVE_CONTATO, JSON.stringify(c));
  } catch {
    // Navegador sem armazenamento (aba anônima, bloqueio): só não lembra.
  }
}

const BOTAO =
  "relative h-[3.35rem] w-full overflow-hidden text-[0.8rem] font-semibold uppercase tracking-[0.12em] transition-[background-color,border-color,color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] active:translate-y-px disabled:opacity-100";

export function FormularioPagamento({
  pedido,
  origem,
  aoFechar,
}: {
  pedido: Pedido | null;
  origem?: string;
  aoFechar: () => void;
}) {
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [empresa, setEmpresa] = React.useState(""); // honeypot
  const [enviando, setEnviando] = React.useState<"pix" | "cartao" | "avulsa" | null>(null);

  React.useEffect(() => {
    const c = lerContato();
    if (c) {
      setNome(c.nome ?? "");
      setEmail(c.email ?? "");
      setWhatsapp(c.whatsapp ?? "");
    }
  }, []);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pedido || enviando) return;

    // O botão apertado diz o meio — na mensal, é ele que define o valor.
    const botao = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const meio = botao?.value === "cartao" ? "cartao" : "pix";

    if (nome.trim().length < 2) return toast.error("Escreva seu nome.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      return toast.error("Confira o e-mail — é para lá que vai o comprovante.");
    if (whatsapp.replace(/\D/g, "").length < 10)
      return toast.error("Confira o WhatsApp com DDD.");

    guardarContato({ nome: nome.trim(), email: email.trim(), whatsapp });
    setEnviando(pedido.tipo === "avulsa" ? "avulsa" : meio);

    const contato = { nome: nome.trim(), email: email.trim(), whatsapp, empresa, origem };
    const [rota, corpo] =
      pedido.tipo === "avulsa"
        ? ["/api/reservas", { ...contato, horarioId: pedido.horarioId }]
        : [
            "/api/pacotes",
            {
              ...contato,
              turma: pedido.turma,
              inicioId: pedido.inicioId,
              horarioIds: pedido.horarioIds,
              meio,
            },
          ];

    try {
      const r = await fetch(rota, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const dados = await r.json();

      if (!r.ok || !dados.ok) {
        toast.error(dados.erro ?? "Não consegui abrir o pagamento.");
        // A agenda na tela está velha — lotou ou mudou enquanto a pessoa
        // preenchia. Insistir nas mesmas datas só repetiria o erro.
        if (dados.motivo === "esgotado" || dados.motivo === "agenda_mudou") {
          setTimeout(() => location.reload(), 1800);
        }
        setEnviando(null);
        return;
      }

      // Navegação de verdade, não window.open: pop-up bloqueado aqui
      // significaria reserva presa esperando um pagamento que não começou.
      location.href = dados.urlPagamento;
    } catch {
      toast.error("Falha de conexão. Tente de novo.");
      setEnviando(null);
    }
  }

  const zap = pedido
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Oi, Isabela! Quero ${
          pedido.tipo === "mensal" ? `a ${pedido.titulo.toLowerCase()}` : "uma aula avulsa"
        } (${pedido.resumo}). Pode me ajudar?`
      )}`
    : "#";

  return (
    <Dialog open={pedido !== null} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{pedido?.titulo ?? ""}</DialogTitle>
          <DialogDescription>{pedido?.resumo ?? ""}</DialogDescription>
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

          {pedido?.tipo === "mensal" ? (
            <div className="mt-1 grid gap-2">
              <button
                type="submit"
                name="meio"
                value="pix"
                disabled={enviando !== null}
                aria-busy={enviando === "pix"}
                className={cn(
                  BOTAO,
                  "bg-vermelho text-branco hover:bg-vermelho-escuro",
                  enviando === "pix" && "barra-carregando"
                )}
              >
                {enviando === "pix" ? "Abrindo o pagamento" : `Pagar ${pedido.pix} no Pix`}
              </button>
              {pedido.cartaoDifere ? (
                <button
                  type="submit"
                  name="meio"
                  value="cartao"
                  disabled={enviando !== null}
                  aria-busy={enviando === "cartao"}
                  className={cn(
                    BOTAO,
                    "border border-vermelho text-vermelho hover:bg-vermelho hover:text-branco",
                    enviando === "cartao" && "barra-carregando"
                  )}
                >
                  {enviando === "cartao" ? "Abrindo o pagamento" : `${pedido.cartao} no cartão · até 12x`}
                </button>
              ) : null}
            </div>
          ) : pedido ? (
            <button
              type="submit"
              value="avulsa"
              disabled={enviando !== null}
              aria-busy={enviando !== null}
              className={cn(
                BOTAO,
                "mt-1 bg-vermelho text-branco hover:bg-vermelho-escuro",
                enviando && "barra-carregando"
              )}
            >
              {enviando ? "Abrindo o pagamento" : `Pagar ${pedido.preco}`}
            </button>
          ) : null}

          <p className="text-center text-[0.75rem] leading-relaxed text-grafite/65">
            Pagamento seguro pela InfinitePay
            {pedido?.tipo === "avulsa" ? ", Pix ou cartão em até 12x" : ""}. Sua
            vaga fica guardada por 20 minutos enquanto você paga.
          </p>

          <a
            href={zap}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-[0.8rem] text-grafite/70 underline underline-offset-4 transition-colors hover:text-vermelho"
          >
            Prefiro falar no WhatsApp
          </a>
        </form>
      </DialogContent>
    </Dialog>
  );
}
