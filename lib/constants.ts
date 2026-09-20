// Dados do ateliê e links de contato.

export const WHATSAPP_NUMBER = "5511957040729";

export const SITE = {
  nome: "Bela Cerâmica",
  artista: "Isabela Molinari",
  dominio: "https://belaceramica.prismax.tech",
  bairro: "Pinheiros",
  cidade: "Pinheiros, São Paulo",
  endereco: "Rua Irmão Lucas, 75, Pinheiros, São Paulo",
} as const;

/**
 * Navegação.
 *
 * As três primeiras são as portas do catálogo da home, na ordem em que a
 * Isabela as pediu. `Obras` e `Sobre` vêm depois porque não vendem nada
 * diretamente. `/encomendas` ficou FORA da barra de propósito: seis itens não
 * cabem no mobile sem virar lista de sistema, e ela é alcançada por dentro de
 * `/obras` e pelo rodapé, que é onde as pessoas a procuram.
 */
export const NAV = [
  { href: "/aulas", label: "Aulas", tipo: "produto" },
  { href: "/oficinas", label: "Oficinas", tipo: "produto" },
  { href: "/atendimentos", label: "Atendimentos", tipo: "produto" },
  { href: "/obras", label: "Obras", tipo: "lateral" },
  { href: "/sobre", label: "Sobre", tipo: "lateral" },
] as const;

/**
 * O DESTINO DE FECHAMENTO.
 *
 * Um só, e o mesmo em todo lugar: a agenda da aula avulsa. É a única coisa no
 * site que alguém consegue comprar sozinho, sem conversa, e é o que paga o
 * aluguel do ateliê.
 *
 * Mora aqui para que nenhuma seção invente o próprio caminho de saída. Toda
 * seção que termina — a pesquisa, a trajetória, o ateliê, as obras — aponta
 * para este endereço. O que uma seção pode escolher é o RÓTULO, porque o
 * argumento muda: quem acabou de ler sobre a pesquisa dela responde a um
 * convite diferente de quem acabou de ver a foto da mesa coletiva.
 */
export const FECHAMENTO = "/aulas#agenda";

/** Fatos verificados sobre a Isabela — não invente linha nova aqui. */
export const ARTISTA = {
  nome: "Isabela Molinari",
  titulo: "Artista visual · Arteterapeuta",
  tituloFrase: "Artista visual e arteterapeuta",
  formacao: "Bacharela em Artes Visuais pela Belas Artes de São Paulo",
  anosEnsinando: 4,
  /** O projeto de oficinas existe desde 2022 — é o nome da marca. */
  projetoDesde: 2022,
} as const;

/**
 * A LINHA DA MARCA.
 *
 * Não é slogan: é descrição. As esculturas dela "revelam o processo como
 * parte essencial da criação" e guardam "o contato direto com o barro
 * molhado" — a frase do portfólio. O barro registra o que a mão fez e leva
 * esse registro para dentro do forno; o que sai é o gesto endurecido.
 *
 * Serve às duas coisas que ela vende ao mesmo tempo, e é por isso que está
 * aqui em vez de num componente: a obra é isso, e a aula é isso. Quem paga
 * R$ 250 numa aula avulsa não está comprando técnica de cerâmica — está
 * comprando duas horas com uma artista cuja pesquisa é exatamente essa.
 *
 * O resto do site não precisa repeti-la. Uma vez, grande, na abertura.
 */
export const LINHA = {
  frase: "O barro guarda o gesto",
  /* A tradução direta da frase, para quem não quer decifrar nada — é o
     "texto bem direto" que a Isabela pediu, logo abaixo do que é poético. */
  apoio:
    "Artista visual e arteterapeuta. Trabalho o corpo, o símbolo e o inconsciente em cerâmica e desenho — e ensino o mesmo processo, às terças, em Pinheiros.",
} as const;

/* A oficina para empresas e eventos mora em `lib/oficina.ts` — ela tem
   etapas, itens inclusos e formatos, e isso não cabe numa constante. */

/* ── Turma mensal ──────────────────────────────────────────────────────── */

export const CURSO = {
  inicio: "1º de setembro",
  diaSemana: "Terças",
  vagasPorTurma: 6,
  endereco: SITE.endereco,
  mensalidadePix: "R$ 800",
  mensalidadeCartao: "R$ 835,08",
} as const;

export const TURMAS = [
  { id: "manha", periodo: "Manhã", horario: "9h30 às 11h30" },
  { id: "tarde", periodo: "Tarde", horario: "13h30 às 15h30" },
] as const;

export const TURMA_OPCOES = [
  { value: "manha", label: "Manhã (9h30 às 11h30)" },
  { value: "tarde", label: "Tarde (13h30 às 15h30)" },
  { value: "tanto_faz", label: "Tanto faz" },
] as const;

export type TurmaValor = (typeof TURMA_OPCOES)[number]["value"];

export const EXPERIENCIA_OPCOES = [
  { value: "nenhuma", label: "Nunca tive contato" },
  { value: "pouca", label: "Um pouco" },
  { value: "pratico", label: "Sim, já pratico" },
] as const;

export type ExperienciaValor = (typeof EXPERIENCIA_OPCOES)[number]["value"];

/* ── Aula avulsa ───────────────────────────────────────────────────────── */

/**
 * O slug que a página de aulas procura no banco. O preço e as vagas NÃO moram
 * aqui: moram na tabela `servicos`, porque a Isabela precisa mudá-los pelo
 * painel sem esperar deploy. Só o identificador é código.
 */
export const SERVICO_AULA_AVULSA = "aula-avulsa";

/* ── WhatsApp ──────────────────────────────────────────────────────────── */

function zap(mensagem: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
}

export function whatsappInscricao(nome: string, turma?: TurmaValor): string {
  const abertura = nome.trim() ? `Sou a/o ${nome.trim()} e quero` : "Quero";
  const periodo =
    turma === "manha"
      ? ", no horário da manhã (9h30)"
      : turma === "tarde"
        ? ", no horário da tarde (13h30)"
        : turma === "tanto_faz"
          ? ", pode ser de manhã ou de tarde"
          : "";
  return zap(
    `Oi, Isabela! ${abertura} garantir minha vaga na turma de cerâmica${periodo}.`
  );
}

export const WHATSAPP_DUVIDA = zap(
  "Oi, Isabela! Tenho uma dúvida sobre as aulas de cerâmica."
);

export const WHATSAPP_ENCOMENDA = zap(
  "Oi, Isabela! Queria conversar sobre uma encomenda."
);

export const WHATSAPP_OFICINA = zap(
  "Oi, Isabela! Queria um orçamento de oficina de cerâmica."
);

export const WHATSAPP_ATENDIMENTO = zap(
  "Oi, Isabela! Queria marcar um atendimento de tarot ou astrologia."
);

export const INSTAGRAM_HANDLE = "zabelamolinari";
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
