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
# As chaves do Supabase NÃO entram aqui: a única que o cliente veria
# (NEXT_PUBLIC_SUPABASE_URL) é lida no route handler, em runtime, junto com a
# service_role. Assim a mesma imagem serve qualquer ambiente e nenhum segredo
# fica assado na camada.
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
RUN apk add --no-cache tini

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

USER node
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
