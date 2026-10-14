#!/usr/bin/env bash
# Nightly backup: Postgres dump + workflow JSON. Run from anywhere; cron example in README.
# Optional: GCS_BUCKET=my-bucket to also upload to Google Cloud Storage.
set -euo pipefail
cd "$(dirname "$0")/.."

BACKUP_DIR="${BACKUP_DIR:-/var/backups/voice-agent}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

docker compose exec -T postgres pg_dump -U n8n -d n8n --clean --if-exists \
  | gzip > "$BACKUP_DIR/n8n-db-$STAMP.sql.gz"

docker compose exec -T -u node n8n n8n export:workflow --all --pretty --output=/tmp/workflows.json >/dev/null
docker compose cp n8n:/tmp/workflows.json "$BACKUP_DIR/workflows-$STAMP.json"
docker compose exec -T -u root n8n rm -f /tmp/workflows.json

find "$BACKUP_DIR" -type f -mtime +"$KEEP_DAYS" -delete

if [ -n "${GCS_BUCKET:-}" ]; then
  gcloud storage cp "$BACKUP_DIR/n8n-db-$STAMP.sql.gz" "$BACKUP_DIR/workflows-$STAMP.json" "gs://$GCS_BUCKET/voice-agent/"
fi

echo "Backup written to $BACKUP_DIR (stamp $STAMP)."
echo "Reminder: the database is useless without the N8N_ENCRYPTION_KEY from .env. Store that key separately."
