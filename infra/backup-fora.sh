#!/bin/bash
# Cópia do backup PARA FORA da VPS.
#
# Chamado pelo backup.sh logo depois de gerar o dump e o arquivo de mídias.
# Sem isto, o backup morava no mesmo disco do banco: perder a máquina levava
# os dois juntos — e desde que o site recebe pagamento, ali há registro
# financeiro e dado pessoal de cliente.
#
# Como funciona:
#   1. cada arquivo é CRIPTOGRAFADO com a chave pública do backup (gpg). A
#      chave privada não está em nenhuma VPS — fica com o Filipe. Quem invadir
#      a prismax ou o destino não lê nada;
#   2. o resultado vai por rsync/ssh para outra máquina (hoje a srv1779470,
#      usuário bkceramica). Lá a chave desta VPS está presa a
#      `rrsync -wo -no-del`: só GRAVA naquela pasta. Não lê, não apaga, não
#      abre shell. Uma prismax comprometida não consegue destruir os backups
#      que já estão fora;
#   3. o destino guarda 90 dias (cron próprio lá, /etc/cron.d/bkceramica-retencao).
#
# Configuração — fora do repositório, em /root/.config/ceramica-backup/:
#   destino            usuario@host
#   chave-publica.asc  chave pública gpg do backup
#   ssh                chave ssh de envio (a .pub está autorizada no destino)
#   known_hosts        a chave do host de destino, conferida
# Sem esses arquivos, o script avisa e sai sem erro: o backup local já foi
# feito e não pode falhar por causa disto.
#
# Para restaurar: baixe o .gpg do destino e rode, onde estiver a chave privada,
#   gpg --decrypt ceramica-AAAAMMDD-HHMM.sql.gz.gpg > ceramica.sql.gz
set -euo pipefail

CONF=/root/.config/ceramica-backup

for f in destino chave-publica.asc ssh known_hosts; do
  if [ ! -f "$CONF/$f" ]; then
    echo "backup-fora: $CONF/$f não existe — cópia externa NÃO configurada" >&2
    exit 0
  fi
done

[ "$#" -gt 0 ] || { echo "backup-fora: nenhum arquivo para enviar" >&2; exit 1; }

DESTINO_REMOTO="$(cat "$CONF/destino")"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -m 700 "$TMP/gnupg" "$TMP/saida"

for arquivo in "$@"; do
  [ -f "$arquivo" ] || continue
  gpg --homedir "$TMP/gnupg" --batch --yes --quiet --trust-model always \
    --recipient-file "$CONF/chave-publica.asc" \
    --output "$TMP/saida/$(basename "$arquivo").gpg" \
    --encrypt "$arquivo"
done

rsync -a --timeout=120 \
  -e "ssh -i $CONF/ssh -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=$CONF/known_hosts -o ConnectTimeout=20" \
  "$TMP/saida/" "$DESTINO_REMOTO:"

echo "backup-fora: $(ls "$TMP/saida" | wc -l) arquivo(s) criptografado(s) enviados para $DESTINO_REMOTO"
