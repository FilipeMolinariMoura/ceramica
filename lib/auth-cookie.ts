/**
 * O nome do cookie, isolado num módulo sem dependências.
 *
 * `lib/auth.ts` é `server-only` e importa `pg`; o `middleware.ts` roda no
 * runtime de edge e não consegue carregar nenhum dos dois. Sem este arquivo, a
 * constante seria duplicada nos dois lados e um dia alguém renomearia só um.
 */
export const COOKIE_SESSAO = "ceramica_sessao";
