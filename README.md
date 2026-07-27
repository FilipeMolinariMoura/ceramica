# Primeira turma de cerâmica — Isabela Molinari

Landing page de página única, mobile-first, para a primeira turma de cerâmica da
artista visual Isabela Molinari, em Pinheiros (SP). O trabalho da página é levar
a pessoa ao WhatsApp com a vaga reservada mentalmente — são 6 vagas, começando em
4 de agosto.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Supabase ·
deploy na Vercel.

---

## Rodando localmente

Pré-requisitos: Node 18.18+ (recomendado 20+).

```bash
npm install
cp .env.example .env.local   # preencha com as chaves do Supabase
npm run dev                  # http://localhost:3000
```

### Variáveis de ambiente

| Variável | Onde usar | O que é |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | cliente + servidor | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | **só servidor** | chave `service_role` (segredo) |

A `service_role` só é lida no route handler `app/api/inscricao/route.ts`. Nunca a
prefixe com `NEXT_PUBLIC_` e nunca a use em componentes client.

---

## Supabase

1. Crie um projeto em <https://supabase.com/dashboard>.
2. Em **SQL Editor**, rode o conteúdo de [`supabase/schema.sql`](supabase/schema.sql):
   ele cria a tabela `inscricoes`, liga o Row Level Security e **não** cria policy
   — assim a escrita só acontece via `service_role`, pelo servidor.
   Se você já tinha criado a tabela antes das duas turmas, rode só o
   `ALTER TABLE … add column … turma` que está no mesmo arquivo.
3. Em **Project Settings → API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Fluxo de captação

Clique no CTA → `Dialog` com 4 campos (Nome, WhatsApp com máscara, **horário da
turma** — manhã/tarde — e experiência) → `POST /api/inscricao` grava no Supabase →
a pessoa é redirecionada ao WhatsApp da Isabela com a mensagem pronta (já incluindo
o horário escolhido).

O **lead nunca se perde**: se o Supabase falhar, o erro vai para o log e o redirect
para o WhatsApp acontece do mesmo jeito. Há um honeypot (`empresa`) contra bots.

---

## Fotos

As seis fotos-fonte ficam em [`fotos-fonte/`](fotos-fonte) e são otimizadas para
`assets/fotos/` (+ `public/og.jpg`) pelo script:

```bash
npm run fotos   # lê fotos-fonte/ e gera JPEGs redimensionados
```

O mapa de qual arquivo vira qual foto está em [`scripts/fotos.mjs`](scripts/fotos.mjs).
As imagens já processadas estão versionadas, então o script só é necessário para
regerar. Todas usam `next/image` com `alt` descritivo (ver `lib/fotos.ts`).

---

## Antes de publicar

- [ ] Preencher o **@ do Instagram** em `lib/constants.ts` (`INSTAGRAM_HANDLE`).
- [ ] Conferir o número do WhatsApp em `lib/constants.ts` (`WHATSAPP_NUMBER`).
- [ ] Ajustar `metadataBase` em `app/layout.tsx` para o domínio final (OG image).

---

## Deploy na Vercel

1. `git push` para o repositório
   [`FilipeMolinariMoura/ceramica`](https://github.com/FilipeMolinariMoura/ceramica.git).
2. Importe o repo em <https://vercel.com/new> (framework detectado: Next.js).
3. Em **Settings → Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e
   `SUPABASE_SERVICE_ROLE_KEY`.
4. Deploy. `npm run build` roda automaticamente.

---

## Scripts

| Comando | O quê |
| --- | --- |
| `npm run dev` | desenvolvimento |
| `npm run build` | build de produção |
| `npm run start` | serve o build |
| `npm run lint` | ESLint |
| `npm run fotos` | redimensiona as fotos-fonte |
