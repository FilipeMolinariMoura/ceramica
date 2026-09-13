# Bela Cerâmica — site da Isabela Molinari

Site do ateliê de cerâmica da artista visual Isabela Molinari, em Pinheiros (SP).

Nasceu em agosto de 2026 como landing de uma turma só. Em setembro virou site
completo: **a landing inteira passou a ser a aba `/aulas`**, e o site ganhou
obras, sobre e encomendas em volta dela.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Postgres ·
tudo self-hosted em Docker na VPS `prismax`, atrás do Caddy compartilhado.

---

## As cinco rotas

| Rota | O que é |
| --- | --- |
| `/` | Home: foto de tela cheia, as três portas do site, a artista e o ateliê |
| `/obras` | Catálogo de peças + galeria do ateliê |
| `/sobre` | Quem é a Isabela e o que guia o trabalho |
| `/aulas` | **A landing original, inteira** — é a página que converte |
| `/encomendas` | Como funciona uma peça sob encomenda |

A barra e o rodapé são do `app/layout.tsx`; nenhuma página monta os seus.

### Por que `/aulas` é uma página longa e não uma seção

Ela tem 20 segundos para vender uma turma: hero próprio com data e vagas,
prova, FAQ, CTA. A home não vende nada na primeira dobra — ela diz de quem é o
ateliê. São trabalhos diferentes, e por isso continuam sendo páginas diferentes.

---

## Publicar uma peça em `/obras`

O catálogo vive em [`lib/obras.ts`](lib/obras.ts) e **nasce vazio de
propósito**: até hoje só existem fotos de aula e de processo no repositório.
Enquanto o array está vazio, a página mostra o estado "as peças novas estão
sendo fotografadas" e empurra para as encomendas — que é verdade.

Para publicar:

1. ponha a foto em `assets/obras/<id>.jpg` (4:5 ou quadrada, fundo limpo)
2. importe no `lib/obras.ts` e acrescente o objeto ao array `OBRAS`

O card já trata os três estados (`disponivel`, `vendida`, `sob-encomenda`) e o
botão leva ao WhatsApp com o nome da peça na mensagem. Não há carrinho: a venda
acontece na conversa, como já acontecia.

**O que falta fotografar:** 6 a 10 peças prontas, uma por foto, fundo neutro,
luz de janela. É o único conteúdo que segura a aba hoje.

---

## Rodando localmente

Pré-requisitos: Node 20+.

```bash
npm install
cp .env.example .env.local   # aponte a DATABASE_URL para um Postgres local
npm run dev                  # http://localhost:3000
```

| Comando | O quê |
| --- | --- |
| `npm run dev` | desenvolvimento |
| `npm run build` | build de produção |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run fotos` | redimensiona as fotos-fonte |

---

## Banco de dados

Postgres da **própria stack** (`ceramica-db`), self-hosted na VPS. Saiu do
Supabase em setembro de 2026: guardar lead de formulário não justificava um
serviço externo, com chave de `service_role` circulando, para uma tabela só.

Não é o banco do Prisma — banco separado é o que permite restaurar, migrar ou
derrubar um sem tocar no outro. Ele **não publica porta**: vive na rede
`ceramica_interna` e só o route handler fala com ele.

| Variável | Onde | O que é |
| --- | --- | --- |
| `DATABASE_URL` | **só servidor** | montada pelo compose a partir de `POSTGRES_SENHA` |

O schema está em [`db/init/01-inscricoes.sql`](db/init/01-inscricoes.sql) e roda
sozinho na primeira subida do contêiner (o `docker-entrypoint` executa o que
está em `/docker-entrypoint-initdb.d` quando o volume está vazio). Depois disso
o arquivo é ignorado: mudança de schema em banco já criado é migration à mão.

**O lead nunca se perde:** se o banco falhar, o erro vai para o log e a pessoa é
redirecionada ao WhatsApp do mesmo jeito — a conversa é o que fecha a turma, o
registro é conveniência. Há um honeypot (`empresa`) contra bots.

### Ver as inscrições

```bash
ssh prismax "docker exec ceramica-db psql -U ceramica -d ceramica \
  -c 'select created_at, nome, whatsapp, turma, experiencia from inscricoes order by created_at desc'"
```

### Backup

[`infra/backup.sh`](infra/backup.sh) faz `pg_dump` de dentro do contêiner
(o banco não é alcançável do host), comprime, guarda em `/opt/ceramica/backups`
e mantém 30 dias. Roda pelo cron da VPS, uma vez por dia.

---

## Deploy

Saiu da Vercel em setembro de 2026. Hoje roda na VPS **`prismax`**
(179.199.138.179), em stack Docker própria, ao lado — e independente — das
stacks do Prisma:

```
/opt/ceramica          este site      → contêiner ceramica-1
/opt/prisma            painel Prisma
/opt/prisma-site       vitrine Prisma
/opt/shared-proxy      Caddy de borda (compartilhado)
```

Stack separada é decisão de projeto: o site da Isabela não pode cair porque o
painel do Prisma subiu uma versão, e vice-versa.

### O ciclo

`git push` na `main` → GitHub Actions roda typecheck e lint → constrói a imagem
e publica no GHCR → entra na VPS por SSH, faz `pull` + `up -d` e recarrega o
Caddy. **A VPS nunca compila.**

Ver [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### O que precisa existir uma vez

No repositório (Settings → Secrets):

- `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
- uma **deploy key** deste repositório, com a chave privada em
  `~/.ssh/repo_ceramica` na VPS

Na VPS, em `/opt/ceramica/.env` (chmod 600):

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`IMAGEM_SITE` é escrita pelo próprio deploy a cada publicação.

### Borda

O bloco do Caddy é versionado em
[`infra/caddy/ceramica.Caddyfile`](infra/caddy/ceramica.Caddyfile) e o deploy o
anexa a `/opt/shared-proxy/Caddyfile` na primeira vez. O que identifica o bloco
lá dentro é o **upstream** (`reverse_proxy ceramica-1:3000`), não o hostname —
assim trocar de domínio não faz o deploy duplicar o bloco.

O site responde em **https://belaceramica.prismax.tech** — subdomínio do
`prismax.tech`, que já é nosso. Um host só ganha certificado depois que o DNS
dele aponta para a VPS.

### Publicar sem o GitHub (contingência)

```bash
rsync -az --delete \
  --exclude=node_modules --exclude=.next --exclude=.git \
  --exclude=fotos-fonte --exclude=backups --exclude=.env \
  ./ prismax:/opt/ceramica/

ssh prismax 'cd /opt/ceramica && docker build -t ceramica/site:local . \
  && sed -i "s|^IMAGEM_SITE=.*|IMAGEM_SITE=ceramica/site:local|" .env \
  && docker compose -f docker-compose.prod.yml up -d'
```

**`--delete` não é opcional.** Sem ele, arquivo apagado aqui continua vivo lá, e
o build quebra por causa de um import que só existe na VPS — foi exatamente o
que aconteceu na migração do Supabase. `.env` fica de fora: a senha do Postgres
mora só lá.

---

## Fotos

As fotos-fonte ficam em [`fotos-fonte/`](fotos-fonte) e viram `assets/fotos/`
(+ `public/og.jpg`) pelo script `npm run fotos`. O mapa de qual arquivo vira
qual foto está em [`scripts/fotos.mjs`](scripts/fotos.mjs); os `alt` descritivos
estão em [`lib/fotos.ts`](lib/fotos.ts).
