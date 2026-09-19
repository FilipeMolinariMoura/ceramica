# Bela Cerâmica — site da Isabela Molinari

Site do ateliê de cerâmica da artista visual Isabela Molinari, em Pinheiros (SP).

Nasceu em agosto de 2026 como landing de uma turma só. Em setembro virou site
completo, e no fim de setembro virou **ponto de venda**: a pessoa escolhe um
horário de aula avulsa, paga pela InfinitePay e recebe a vaga confirmada, sem
passar pelo WhatsApp. A Isabela opera tudo por um painel próprio.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Postgres ·
tudo self-hosted em Docker na VPS `prismax`, atrás do Caddy compartilhado.

---

## As rotas

| Rota | O que é |
| --- | --- |
| `/` | Catálogo de três portas, a artista, prints "em breve" e o ateliê |
| `/aulas` | **Agenda de aula avulsa com pagamento** + turma mensal |
| `/aulas/reserva/[token]` | Retorno do pagamento: confirmação, comprovante, `.ics` |
| `/oficinas` | Oficina fechada — briefing de orçamento |
| `/atendimentos` | Tarot e astrologia → WhatsApp |
| `/obras` | Catálogo de peças + galeria do ateliê |
| `/sobre` | Quem é a Isabela e o que guia o trabalho |
| `/encomendas` | Como funciona uma peça sob encomenda |
| `/painel` | Painel da Isabela (login) |

### Layouts

Há dois grupos de rota, e a diferença importa:

- `app/(site)/` — barra, rodapé e botão do WhatsApp;
- `app/painel/(interno)/` — a casca do painel, que valida a sessão.

O layout raiz (`app/layout.tsx`) só tem `<html>`, fontes e o `Toaster`. Foi
assim que o painel deixou de renderizar a navegação pública por cima da tela
de gestão. E o grupo `(interno)` existe porque o layout que exige sessão não
pode envolver a própria tela de entrada — se envolvesse, quem não tem sessão
seria mandado para lá, aquilo renderizaria o mesmo layout e mandaria de novo.

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
npm run migrar               # cria o schema
npm run semear:dev           # horários para a agenda ter o que mostrar
npm run dev                  # http://localhost:3000
```

| Comando | O quê |
| --- | --- |
| `npm run dev` | desenvolvimento |
| `npm run build` | build de produção |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run migrar` | aplica as migrations pendentes |
| `npm run semear:dev` | horários de brincadeira para a agenda |
| `npm run verificar:agenda` | invariantes de concorrência e pagamento |
| `npm run usuario` | cria/troca a senha do painel |
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

### Migrations

O schema vive em [`db/migracoes/`](db/migracoes), aplicado por
[`scripts/migrar.mjs`](scripts/migrar.mjs).

Antes ele morava em `db/init/`, montado em `/docker-entrypoint-initdb.d`. Aquele
diretório **só roda com o volume vazio**: em produção o banco já existia, então
ele nunca foi executado ali e o schema de desenvolvimento vinha divergindo do de
produção em silêncio. A montagem saiu do compose e a migration `001` é o
conteúdo daquele arquivo — toda ela `if not exists`, portanto um no-op no banco
que já está de pé.

```bash
npm run migrar            # aplica o que falta
npm run migrar -- --status
```

No deploy ela roda como **portão de release**, entre o `pull` e o `up -d`, num
contêiner descartável com a imagem nova. Se falhar, o `set -e` aborta o deploy e
o contêiner antigo continua no ar. No boot do site seria o contrário: o `up -d`
já teria destruído o antigo antes de o novo falhar.

Migration nova é um arquivo `NNN-nome.sql`; a ordem do nome é a ordem de
aplicação. Cada uma roda na própria transação.

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
(o banco não é alcançável do host), arquiva o volume de mídias junto, comprime,
guarda em `/opt/ceramica/backups` e mantém 30 dias. Roda pelo cron da VPS.

**O que ainda falta, e agora pesa:** o backup mora no mesmo disco da VPS.
Enquanto era uma lista de leads, dava. Desde que o site recebe pagamento, ali
há registro financeiro e dado pessoal de cliente — perder a máquina levaria
banco e backup juntos. Falta cópia fora da máquina, e falta política de
retenção e página de privacidade (LGPD).

---

## Agenda e pagamento

O caminho do dinheiro. É a parte do repositório que mais merece cuidado numa
refatoração, e a que tem teste automatizado (`npm run verificar:agenda`).

### A lotação é uma linha, não uma contagem

`horarios` guarda `vagas` e `ocupadas`, com `check (ocupadas <= vagas)`.
Reservar é um `update ... where ocupadas < vagas`: `rowCount = 0` significa
esgotado. O row lock dura microssegundos.

Advisory lock ficou de fora de propósito. Lock é convenção: qualquer caminho
futuro que esqueça de pegá-lo — o painel remarcando, um `psql` de correção —
fura a regra sem erro nenhum. O `CHECK` não tem como ser esquecido.

Devolver vaga de hold vencido agrega por horário antes de decrementar. O
`group by` não é enfeite: `update ... from` afeta cada linha-alvo **uma vez**,
por mais linhas que casem na origem — sem ele, duas reservas vencidas no mesmo
horário devolveriam uma vaga só.

### A chamada à InfinitePay acontece fora da transação

A sequência é: transação curta toma a vaga e grava a reserva pendente →
**commit** → só então o link de pagamento é criado → falhou, a vaga volta na
hora.

Fazer a chamada HTTP com a transação aberta seguraria uma conexão do pool pelo
tempo do round-trip. Algumas simultâneas esgotam o pool, e o pool é o mesmo da
home, da agenda e do painel: o site **inteiro** pararia, não só o checkout.

Pela mesma razão, `lib/db.ts` tem `emTransacao()`. `db().query("begin")` não
transaciona nada — o pool devolve a conexão a cada chamada, e o `insert`
seguinte sai em outra.

### O webhook não é assinado

A API de Checkout da InfinitePay não usa chave: quem identifica a conta é o
`handle`. O webhook que ela dispara também não é assinado, então **o corpo dele
nunca é tratado como prova**. Ele é só um gatilho. Três camadas:

1. a URL do webhook carrega um token de 32 bytes, por reserva;
2. a confirmação vem de `payment_check`, uma pergunta **nossa** à InfinitePay;
3. `unique (transaction_nsu)` impede reaproveitar o comprovante de uma compra
   legítima para liberar a reserva de outra pessoa.

**O valor é conferido contra `amount`, nunca contra `paid_amount`.** O líquido
vem descontado da taxa; comparar por ele recusaria toda venda no crédito — erro
que só apareceria em produção, derrubando 100% dos pagamentos no cartão.

### Quem pagou e ficou sem vaga

Pagamento que chega depois do hold vencer tenta retomar a vaga. Se não
conseguir, a reserva vira `paga_sem_vaga` e aparece **em destaque no painel**.
Nunca em silêncio: é dinheiro de alguém que ficou sem aula.

### O que ainda falta aqui

- **Reconciliação.** Se o webhook se perder (deploy recriando o contêiner, por
  exemplo), a varredura preguiçosa pode marcar como expirada uma reserva paga.
  Falta um `infra/reconciliar.sh` no mesmo cron do backup, rodando
  `payment_check` nas pendentes. Hoje a página de retorno cobre o caso comum,
  porque ela também confere.
- **Aviso à Isabela** a cada reserva (e-mail ou push). Hoje ela descobre
  abrindo o painel.

### Pré-requisitos na conta da InfinitePay

O `handle` é o InfiniteTag, sem o `$`. É preciso ligar **"Checkout externo"** em
`app.infinitepay.io/external-checkout` → Configurações; sem isso a API responde
`external_checkout_not_enabled` e nenhum link é criado.

---

## Painel

`/painel`, e-mail e senha, uma pessoa só. Sem tela de cadastro: a conta nasce de
[`scripts/criar-usuario.mjs`](scripts/criar-usuario.mjs).

```bash
npm run usuario -- isabela@exemplo.com "Isabela Molinari"

# na VPS
docker compose -f docker-compose.prod.yml run --rm -it site \
  node scripts/criar-usuario.mjs isabela@exemplo.com "Isabela Molinari"
```

Senha com `scrypt` do Node, comparação com `timingSafeEqual`, sessão em cookie
`httpOnly` com só o hash do token no banco, e limite de tentativas por IP.

**A regra que não pode ser esquecida:** toda Server Action do painel começa com
`exigirSessao()`. O `middleware.ts` só confere se existe cookie (ele roda no
edge e não alcança o banco) e protege apenas as páginas. Cada Server Action é
um endpoint POST próprio, invocável direto, que não passa por ele.

Não existe apagar horário no painel, de propósito — apagaria a aula de quem
pagou. Só "tirar do ar", que some com ele da agenda e mantém as reservas.

---

## Desenvolvimento da agenda

```bash
npm run migrar            # schema
npm run semear:dev        # horários de brincadeira, terças e quintas
npm run verificar:agenda  # as invariantes de concorrência e pagamento
```

`verificar:agenda` usa um serviço com slug próprio (`__verificacao`) e se limpa
no fim, então não encosta em dado real — e recusa rodar fora de localhost.

Para exercitar o pagamento sem conta da InfinitePay, aponte
`INFINITEPAY_BASE` para um dublê local no `.env.local`. A variável é **ignorada
em produção** de propósito: uma variável capaz de redirecionar para onde vão os
dados do pagamento seria um belo alvo.

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
POSTGRES_SENHA=...          # gere uma vez, ver a mensagem do próprio deploy
INFINITEPAY_HANDLE=...      # o InfiniteTag da Isabela, sem o cifrão
SITE_ORIGEM=https://belaceramica.prismax.tech
```

`IMAGEM_SITE` é escrita pelo próprio deploy a cada publicação. O deploy recusa
subir se `POSTGRES_SENHA` ou `INFINITEPAY_HANDLE` não existirem — sem o
segundo, a agenda aparece mas nenhuma reserva consegue abrir pagamento.

As chaves do Supabase saíram daqui: o banco é da própria stack desde setembro
de 2026 e ninguém lê aquelas variáveis há tempo.

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
