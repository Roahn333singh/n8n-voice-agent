#!/usr/bin/env bash
# Restores a Postgres dump made by backup.sh. Replaces the current n8n database.
set -euo pipefail
cd "$(dirname "$0")/.."

FILE="${1:?usage: scripts/restore.sh /var/backups/voice-agent/n8n-db-STAMP.sql.gz}"

read -r -p "This REPLACES the current n8n database with $FILE. Type RESTORE to continue: " answer
[ "$answer" = "RESTORE" ] || { echo "Aborted."; exit 1; }

docker compose stop n8n
gunzip -c "$FILE" | docker compose exec -T postgres psql -U n8n -d n8n -v ON_ERROR_STOP=1 >/dev/null
docker compose start n8n

echo "Restored. N8N_ENCRYPTION_KEY in .env must be the key that was in use when the backup was taken."
