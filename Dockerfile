# Imagem do site da Bela Cerâmica.
#
# Saiu da Vercel em setembro de 2026 e passou a rodar na mesma VPS do Prisma
# (prismax), em stack própria — /opt/ceramica, contêiner ceramica-1, atrás do
# Caddy compartilhado. Stack separada de propósito: o site da Isabela não pode
# cair porque o painel do Prisma subiu uma versão, e vice-versa.
#
# A VPS NUNCA compila: o GitHub Actions constrói, publica no GHCR e a VPS só
# faz `pull` + `up -d`.

FROM node:22-alpine AS base
WORKDIR /app

FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Nenhum segredo entra aqui: tudo que o servidor precisa (DATABASE_URL,
# INFINITEPAY_HANDLE) é lido em runtime, pelo compose. Assim a mesma imagem
# serve qualquer ambiente e nada fica assado na camada.
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
RUN apk add --no-cache tini

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# As migrations e o runner NÃO vêm no standalone — ele só traz o que o
# server.js importa. Sem estas duas linhas o passo de migration do deploy
# rodaria contra um diretório vazio e "passaria" sem migrar nada.
COPY --from=build /app/db/migracoes ./db/migracoes
COPY --from=build /app/scripts/migrar.mjs ./scripts/migrar.mjs

# Falhar alto, e não em silêncio: sem o sharp o Next desliga a otimização de
# imagem e serve o original, com AVIF configurado e nada sendo gerado. Já
# aconteceu uma vez; agora o build quebra em vez de degradar.
RUN node -e "require('sharp'); console.log('sharp ok')"

# O volume de mídias é montado aqui. O diretório precisa EXISTIR e já ser do
# usuário `node` antes do volume subir: o Docker copia a ownership do caminho
# na primeira montagem, e um volume em caminho inexistente nasce root:root —
# o upload falharia só na VPS, no primeiro uso do painel.
RUN mkdir -p /dados/midias && chown -R node:node /dados

USER node
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
# Migration NÃO roda aqui. Ela é passo de release no deploy (ver
# .github/workflows/deploy.yml): no boot, uma migration ruim viraria crashloop
# com o contêiner antigo já destruído e o site fora do ar.
CMD ["node", "server.js"]
