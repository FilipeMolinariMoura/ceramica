/**
 * Freio de requisições por IP, em memória.
 *
 * Existe por um motivo concreto: reservar NÃO custa nada até a hora de pagar.
 * Sem freio, um script consegue segurar as quatro vagas de todos os horários a
 * cada 20 minutos, de graça, e a agenda fica permanentemente "esgotada" sem
 * que um centavo entre. Para o ateliê isso não é vandalismo abstrato, é o
 * aluguel do mês.
 *
 * Memória, e não banco, porque o custo precisa ser zero no caminho quente e
 * porque o site roda num processo só. As consequências, assumidas: o contador
 * zera a cada deploy, e um atacante com muitos IPs passa. Ele corta o caso
 * comum — um laço vindo de uma máquina — que é o que se vê na prática.
 */

type Janela = { contagem: number; expiraEm: number };

const global_ = globalThis as typeof globalThis & {
  __limiteCeramica?: Map<string, Janela>;
};

function mapa(): Map<string, Janela> {
  global_.__limiteCeramica ??= new Map();
  return global_.__limiteCeramica;
}

/**
 * Devolve `true` quando a ação está liberada.
 *
 * `chave` deve incluir a operação, não só o IP: o freio de reservar não pode
 * bloquear o de entrar no painel.
 */
export function permitido(
  chave: string,
  limite: number,
  janelaMs: number
): boolean {
  const agora = Date.now();
  const m = mapa();

  // Faxina preguiçosa: sem isto o Map cresce para sempre num processo de longa
  // duração, um IP por linha.
  if (m.size > 5_000) {
    for (const [k, v] of m) if (v.expiraEm <= agora) m.delete(k);
  }

  const atual = m.get(chave);
  if (!atual || atual.expiraEm <= agora) {
    m.set(chave, { contagem: 1, expiraEm: agora + janelaMs });
    return true;
  }
  if (atual.contagem >= limite) return false;
  atual.contagem += 1;
  return true;
}

/**
 * IP de quem chamou, atrás do Caddy.
 *
 * `x-forwarded-for` é falsificável por quem fala direto com o Node, mas o Node
 * aqui só é alcançável pelo proxy (ver docker-compose.prod.yml: o site não
 * publica porta, só o Caddy fala com ele), e o Caddy reescreve o cabeçalho.
 */
export function ipDaRequisicao(req: Request): string {
  const encaminhado = req.headers.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "desconhecido";
}
