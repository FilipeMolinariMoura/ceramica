import Link from "next/link";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { InscricaoCta } from "@/components/inscricao-cta";
import { SeisLugares } from "@/components/seis-lugares";
import { vitrineDasAulas } from "@/lib/vitrine";

/**
 * O fechamento da página. Diz a data de verdade do próximo pacote e quantos
 * lugares sobram nele — antes dizia "Turmas de setembro" e "as aulas começam
 * em 1º de setembro", fixo no código, e continuou dizendo depois de setembro.
 *
 * Sem pacote aberto, a mesma faixa vira lista de espera: é melhor guardar o
 * contato de quem chegou até aqui do que mostrar um botão sem destino.
 */
export async function CtaFinal() {
  const { mensal, proximoPacote } = await vitrineDasAulas();

  return (
    <section id="inscricao" className="bg-vermelho py-24 text-papel sm:py-32">
      <Container className="flex flex-col items-center text-center">
        <Reveal className="flex flex-col items-center" tipo="faixa">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-papel/70">
            {proximoPacote
              ? `Próxima turma · ${proximoPacote.dia} ${proximoPacote.data} · ${proximoPacote.hora}`
              : "Turma mensal · Pinheiros"}
          </p>
          <h2 className="titulo-secao mt-5 font-display font-light tracking-[-0.02em] text-papel sm:text-6xl lg:text-7xl">
            {proximoPacote ? "Inscrições abertas" : "Lista de espera"}
          </h2>
          {mensal ? (
            <p className="mt-5 max-w-md text-lg text-papel/85">
              {mensal.aulas} terças por {mensal.pix} — {mensal.porAula} por aula.
              {proximoPacote
                ? ` ${proximoPacote.minRestantes === 1 ? "Resta 1 lugar" : `Restam ${proximoPacote.minRestantes} lugares`}.`
                : ""}
            </p>
          ) : null}
        </Reveal>

        <Reveal className="mt-10 flex flex-col items-center gap-8">
          <SeisLugares tone="claro" caption="" className="items-center" />
          {proximoPacote ? (
            <Link
              href={`/aulas?plano=mensal&turma=${proximoPacote.turma}&origem=cta-final#agenda`}
              className="inline-flex h-[3.35rem] items-center justify-center bg-branco px-8 text-[0.85rem] font-semibold uppercase tracking-[0.12em] text-vermelho transition-[background-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:bg-papel active:translate-y-px"
            >
              Garantir minhas terças
            </Link>
          ) : (
            <InscricaoCta origem="cta-final" variant="claro" label="Entrar na lista" />
          )}
        </Reveal>
      </Container>
    </section>
  );
}
