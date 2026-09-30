import { cache } from "react";
import {
  diaCurto,
  diaLongo,
  diaSemanaCurto,
  horaCurta,
  horariosDisponiveis,
  montarPacotes,
  precosDaMensal,
  reais,
  servicoPorSlug,
  turmaDe,
  type PrecosMensal,
} from "@/lib/agenda";
import { SERVICO_AULA_AVULSA, SERVICO_TURMA_MENSAL, TURMAS, type TurmaId } from "@/lib/constants";

/**
 * O que as vitrines do site mostram sobre as aulas: preço, preço por aula da
 * mensal e a PRÓXIMA data com lugar — já em texto, no fuso de Brasília.
 *
 * Existe para que a home, `/ceramica` e as seções de `/aulas` digam a mesma
 * coisa, tirada do mesmo lugar. Antes o preço da mensal era uma string fixa
 * no código e a data de início era "1º de setembro" até dezembro.
 *
 * `cache` do React: várias seções da mesma página pedem isto, e o banco é
 * consultado uma vez por requisição.
 */

export type ProximaData = {
  id: number;
  dia: string;
  data: string;
  diaLongo: string;
  hora: string;
  turma: TurmaId | null;
  restantes: number;
  vagas: number;
};

export type ProximoPacote = {
  turma: TurmaId;
  periodo: string;
  inicioId: number;
  dia: string;
  data: string;
  fim: string;
  hora: string;
  minRestantes: number;
};

export type Vitrine = {
  avulsa: { preco: string; centavos: number } | null;
  mensal:
    | (PrecosMensal & {
        pix: string;
        cartao: string;
        porAula: string;
        economia: string;
      })
    | null;
  proximaAula: ProximaData | null;
  proximoPacote: ProximoPacote | null;
};

export const vitrineDasAulas = cache(async (): Promise<Vitrine> => {
  const [avulsa, mensal] = await Promise.all([
    servicoPorSlug(SERVICO_AULA_AVULSA),
    servicoPorSlug(SERVICO_TURMA_MENSAL),
  ]);
  if (!avulsa) return { avulsa: null, mensal: null, proximaAula: null, proximoPacote: null };

  const horarios = await horariosDisponiveis(avulsa.id, { diasAFrente: 120 });

  const h = horarios.find((x) => x.restantes > 0);
  const proximaAula: ProximaData | null = h
    ? {
        id: h.id,
        dia: diaSemanaCurto(h.inicio),
        data: diaCurto(h.inicio),
        diaLongo: diaLongo(h.inicio),
        hora: horaCurta(h.inicio),
        turma: turmaDe(h.inicio),
        restantes: h.restantes,
        vagas: h.vagas,
      }
    : null;

  // O pacote que começa mais cedo, de qualquer turma.
  let proximoPacote: ProximoPacote | null = null;
  if (mensal) {
    for (const t of TURMAS) {
      const o = montarPacotes(horarios, t.id, mensal.aulas).find((x) => x.disponivel);
      if (!o) continue;
      if (proximoPacote && o.inicios[0]!.getTime() >= inicioDe(proximoPacote, horarios)) continue;
      proximoPacote = {
        turma: t.id,
        periodo: t.periodo,
        inicioId: o.inicioId,
        dia: diaSemanaCurto(o.inicios[0]!),
        data: diaCurto(o.inicios[0]!),
        fim: diaCurto(o.inicios.at(-1)!),
        hora: horaCurta(o.inicios[0]!),
        minRestantes: o.minRestantes,
      };
    }
  }

  const p = mensal ? precosDaMensal(avulsa, mensal) : null;

  return {
    avulsa: { preco: reais(avulsa.precoCentavos), centavos: avulsa.precoCentavos },
    mensal: p
      ? {
          ...p,
          pix: reais(p.pixCentavos),
          cartao: reais(p.cartaoCentavos),
          porAula: reais(p.porAulaPixCentavos),
          economia: reais(p.economiaCentavos),
        }
      : null,
    proximaAula,
    proximoPacote,
  };
});

function inicioDe(p: ProximoPacote, horarios: { id: number; inicio: Date }[]): number {
  return horarios.find((h) => h.id === p.inicioId)?.inicio.getTime() ?? Infinity;
}
