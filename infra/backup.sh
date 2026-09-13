#!/bin/bash
# Backup diário do banco de inscrições.
#
# Roda pelo cron em /opt/ceramica. Mesma forma do backup do Prisma: `pg_dump`
# de dentro do contêiner, porque o Postgres não publica porta nenhuma (de
# propósito) e não há como alcançá-lo do host. `docker exec` ainda garante que
# a versão do cliente bate com a do servidor.
#
# Retenção de 30 dias — este banco cresce alguns kB por mês, guardar mais tempo
# não custa nada e uma turma perdida seria notada tarde.
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

ARQUIVO="$DESTINO/ceramica-$(date +%Y%m%d-%H%M).sql.gz"

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

find "$DESTINO" -name 'ceramica-*.sql.gz' -mtime "+$DIAS_GUARDADOS" -delete
find "$DESTINO" -name '*.parcial' -mmin +120 -delete
