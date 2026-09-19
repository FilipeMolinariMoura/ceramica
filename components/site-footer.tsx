import Link from "next/link";
import { Container } from "@/components/section";
import {
  CURSO,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  NAV,
  SITE,
  WHATSAPP_DUVIDA,
} from "@/lib/constants";

/**
 * Rodapé do site inteiro. Substituiu o rodapé da landing, que falava só de
 * turma ("Turmas de setembro · Terças") — informação que envelhece e que agora
 * vive só na aba de aulas.
 */
export function SiteFooter() {
  const ano = new Date().getFullYear();

  return (
    <footer className="bg-preto py-16 text-papel sm:py-20">
      <Container className="flex flex-col gap-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-2xl text-papel">{SITE.nome}</p>
            <p className="font-display text-2xl italic text-papel/70">
              {SITE.artista}
            </p>
            <p className="mt-4 max-w-xs text-[0.98rem] leading-relaxed text-papel/60">
              Ateliê de cerâmica e processos criativos em {SITE.cidade}.
            </p>
          </div>

          <nav className="flex flex-col gap-2.5">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-papel/45">
              Navegar
            </p>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="w-fit text-papel/85 transition-colors hover:text-verde"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2.5">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-papel/45">
              Contato
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-papel/85 transition-colors hover:text-verde"
            >
              @{INSTAGRAM_HANDLE}
            </a>
            <a
              href={WHATSAPP_DUVIDA}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-papel/85 transition-colors hover:text-verde"
            >
              WhatsApp
            </a>
            <p className="mt-1 text-[0.95rem] leading-relaxed text-papel/60">
              {CURSO.endereco}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-papel/15 pt-6 text-[0.8rem] text-papel/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {ano} {SITE.artista} · {SITE.cidade}
          </p>
          <p>Peças, aulas e encomendas</p>
        </div>
      </Container>
    </footer>
  );
}
