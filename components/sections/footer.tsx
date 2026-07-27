import { Container } from "@/components/section";
import {
  CURSO,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  WHATSAPP_DUVIDA,
} from "@/lib/constants";

export function Footer() {
  const ano = new Date().getFullYear();
  return (
    <footer className="bg-barro py-16 text-lona">
      <Container className="flex flex-col gap-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="font-display text-2xl text-lona">Cerâmica</p>
            <p className="font-display text-2xl italic text-lona/70">
              com Isabela Molinari
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-lona/45">
              Onde
            </p>
            <p className="text-lona/85">{CURSO.endereco}</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-lona/45">
              Contato
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-lona/85 transition-colors hover:text-parede"
            >
              Instagram @{INSTAGRAM_HANDLE}
            </a>
            <a
              href={WHATSAPP_DUVIDA}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-lona/85 transition-colors hover:text-parede"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-lona/15 pt-6 text-[0.8rem] text-lona/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {ano} Isabela Molinari · Pinheiros, São Paulo</p>
          <p>Primeira turma · Terças de manhã</p>
        </div>
      </Container>
    </footer>
  );
}
