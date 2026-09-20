/// <reference types="next" />
/// <reference types="next/image-types/global" />

/**
 * As declarações de tipo do Next, versionadas.
 *
 * ── Por que este arquivo existe ───────────────────────────────────────────
 * O Next gera `next-env.d.ts` na raiz e o próprio `create-next-app` o põe no
 * `.gitignore`. É ele que declara o módulo de um `import foto from "./x.jpg"`,
 * pela referência a `next/image-types/global`.
 *
 * Funciona no computador de quem desenvolve, porque `next dev` regenera o
 * arquivo. Não funciona no CI: o job `verificar` roda `npm ci` e `tsc --noEmit`
 * sem nunca chamar o Next, então `next-env.d.ts` não existe lá e TODO import
 * de imagem vira `TS2307: Cannot find module`. Foram 28 erros na primeira vez
 * que o job rodou — um por foto — e o deploy parou antes de construir a imagem.
 *
 * O arquivo aqui é o mesmo par de referências, versionado, num caminho que o
 * `include` do tsconfig já cobre pelo curinga de arquivos TypeScript. A
 * terceira linha do `next-env.d.ts`, que aponta para `.next/types/routes.d.ts`,
 * fica de fora de propósito: ela leva para dentro de `.next`, que o CI também
 * não tem, e só serve a rotas tipadas, que este projeto não usa.
 *
 * Alternativa descartada: tirar `next-env.d.ts` do `.gitignore`. O Next
 * reescreve aquele arquivo a cada `dev` e a cada `build`, então ele viveria
 * aparecendo sujo no `git status` — e o próprio arquivo pede para não ser
 * editado.
 */

export {};
