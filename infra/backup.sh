#!/bin/bash
# Backup diário do banco e das mídias.
#
# Roda pelo cron em /opt/ceramica. Mesma forma do backup do Prisma: `pg_dump`
# de dentro do contêiner, porque o Postgres não publica porta nenhuma (de
# propósito) e não há como alcançá-lo do host. `docker exec` ainda garante que
# a versão do cliente bate com a do servidor.
#
# Retenção de 30 dias — este banco cresce alguns kB por mês, guardar mais tempo
# não custa nada e uma turma perdida seria notada tarde.
#
# ATENÇÃO, e isto mudou de peso em setembro de 2026: desde que o site passou a
# receber pagamento, o que está aqui deixou de ser uma lista de leads e virou
# registro financeiro e dado pessoal de cliente. Duas consequências:
#
#   1. (resolvido em 02/10/2026) o destino daqui é o MESMO disco da VPS;
#      desde então cada backup também sai criptografado para outra máquina,
#      pelo infra/backup-fora.sh chamado no fim deste script;
#   2. LGPD: não há política de retenção nem página de privacidade publicada.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

DESTINO="$DIR/backups"
DIAS_GUARDADOS=30
CONTAINER=ceramica-db

mkdir -p "$DESTINO"

if ! docker inspect "$CONTAINER" >/dev/null 2>&1; then
  echo "backup: contêiner $CONTAINER não existe, nada a fazer" >&2
  exit 0
fi

CARIMBO="$(date +%Y%m%d-%H%M)"
ARQUIVO="$DESTINO/ceramica-$CARIMBO.sql.gz"

docker exec "$CONTAINER" pg_dump \
  --username ceramica \
  --dbname ceramica \
  --no-owner \
  --clean \
  --if-exists \
  | gzip -9 > "$ARQUIVO.parcial"

# Só vira backup de verdade depois de terminar. Um arquivo cortado no meio com
# nome definitivo é pior que backup nenhum: parece que existe.
mv "$ARQUIVO.parcial" "$ARQUIVO"

echo "backup: $ARQUIVO ($(du -h "$ARQUIVO" | cut -f1))"

# ── Mídias ────────────────────────────────────────────────────────────────
# As imagens que a Isabela sobe pelo painel moram num volume, fora do banco.
# Sem esta parte, restaurar o dump devolveria páginas apontando para arquivos
# que não existem mais — o banco voltaria "inteiro" e o site, quebrado.
MIDIAS="$DESTINO/midias-$CARIMBO.tar.gz"

if docker volume inspect ceramica-midias >/dev/null 2>&1; then
  docker run --rm \
    -v ceramica-midias:/dados:ro \
    -v "$DESTINO":/destino \
    alpine:3 tar -czf "/destino/midias-$CARIMBO.tar.gz.parcial" -C /dados .
  mv "$MIDIAS.parcial" "$MIDIAS"
  echo "backup: $MIDIAS ($(du -h "$MIDIAS" | cut -f1))"
else
  echo "backup: volume ceramica-midias ainda não existe, nada a arquivar"
fi

# ── Cópia para fora da VPS ─────────────────────────────────────────────────
# Criptografada e enviada para outra máquina — ver infra/backup-fora.sh. Se
# falhar, o backup local continua valendo, mas a falha fica BEM visível no
# cron.log: backup externo parado em silêncio é o pior tipo de backup.
ENVIAR=("$ARQUIVO")
[ -f "$MIDIAS" ] && ENVIAR+=("$MIDIAS")
if ! bash "$DIR/infra/backup-fora.sh" "${ENVIAR[@]}"; then
  echo "backup: ATENÇÃO — a cópia para fora da VPS FALHOU hoje" >&2
fi

find "$DESTINO" -name 'ceramica-*.sql.gz' -mtime "+$DIAS_GUARDADOS" -delete
find "$DESTINO" -name 'midias-*.tar.gz' -mtime "+$DIAS_GUARDADOS" -delete
find "$DESTINO" -name '*.parcial' -mmin +120 -delete
