/**
 * A OFICINA PARA EMPRESAS E EVENTOS.
 *
 * Tudo aqui está transcrito do deck que a Isabela manda para cliente
 * (`Oficina-de-Ceramica-Isabela-Molinari.pdf`, quatro páginas). Nada foi
 * suavizado, arredondado ou acrescentado.
 *
 * ── Por que isto virou um arquivo ─────────────────────────────────────────
 * Porque é o produto de maior valor do ateliê e o site praticamente não o
 * descrevia. A página dizia "aniversário, time, bodas", listava quatro linhas
 * genéricas e terminava em "o valor depende de quantas pessoas, de onde e de
 * quando — conte no formulário e a Isabela responde com o número".
 *
 * Enquanto isso, o deck dela ABRE com R$ 320 por participante, em corpo
 * grande, na primeira página, junto com duração e tamanho de grupo. Ou seja:
 * o site era mais fechado com o preço do que ela é. Isso não protege margem —
 * só adiciona uma ida e volta de WhatsApp antes de a pessoa descobrir se cabe
 * no orçamento, e parte delas não volta.
 *
 * Uma oficina de 6 pessoas são R$ 1.920; uma de 30, R$ 9.600. É a diferença
 * entre pagar o aluguel do mês e não pagar.
 */

export const OFICINA = {
  precoPorPessoa: 320,
  minimo: 6,
  maximo: 30,
  duracao: "2 horas",
  duracaoAlternativa: "adaptável para 1h30",
  prazoEntrega: "até 45 dias",
  resumo:
    "Uma atividade prática de modelagem em cerâmica em que cada participante desenvolve uma peça autoral, finalizada e esmaltada pela artista.",
} as const;

/** O que dá para escolher que as pessoas façam. Do deck, página 2. */
export const FORMATOS = [
  "Tema livre",
  "Canecas",
  "Pratos",
  "Vasos",
] as const;

/** As quatro etapas, numeradas como ela numera. */
export const ETAPAS = [
  {
    titulo: "Introdução ao barro",
    texto:
      "Apresentação dos materiais, das ferramentas e das técnicas de modelagem.",
  },
  {
    titulo: "Modelagem",
    texto:
      "Os participantes desenvolvem suas peças, com acompanhamento durante toda a atividade.",
  },
  {
    titulo: "Finalização",
    texto:
      "Cada participante escolhe as cores da esmaltação e identifica a sua peça.",
  },
  {
    titulo: "Queima e entrega",
    texto:
      "As peças passam por duas queimas e pelo processo de esmaltação. Entrega em até 45 dias.",
  },
] as const;

/** O que está incluso no valor. Seis itens, os seis do deck. */
export const INCLUSO = [
  "Todos os materiais",
  "Ferramentas",
  "Acompanhamento durante toda a oficina",
  "Primeira queima, esmaltação e segunda queima",
  "Ecobag exclusiva criada pela artista",
  "Entrega das peças finalizadas em até 45 dias",
] as const;

export const PERSONALIZACAO =
  "Cada oficina pode ser adaptada à identidade do evento, da paleta de cores ao formato das peças que serão criadas.";

/**
 * O intervalo de investimento, calculado e não digitado — se o preço por
 * pessoa mudar, a faixa muda junto.
 *
 * Devolve "X e Y", e não "X a Y", porque quem chama escreve "fica entre".
 */
export function faixaDeInvestimento(): string {
  const reais = (n: number) =>
    n.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    });
  return `${reais(OFICINA.precoPorPessoa * OFICINA.minimo)} e ${reais(
    OFICINA.precoPorPessoa * OFICINA.maximo
  )}`;
}
