#!/usr/bin/env bash
# Restore drill: load a backup into a throwaway Postgres container and compare it with the live database.
# Changes nothing in the running system. Run monthly, or after changing backup.sh.
#   sudo ./scripts/restore-test.sh                     newest backup
#   sudo ./scripts/restore-test.sh <file>.sql.gz       a specific backup
set -euo pipefail
cd "$(dirname "$0")/.."

BACKUP_DIR="${BACKUP_DIR:-/var/backups/voice-agent}"
FILE="${1:-$(ls -t "$BACKUP_DIR"/n8n-db-*.sql.gz | head -1)}"
NAME=voice-agent-restore-test
echo "Backup file: $FILE ($(du -h "$FILE" | cut -f1))"

docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" -e POSTGRES_USER=n8n -e POSTGRES_PASSWORD=drill -e POSTGRES_DB=n8n postgres:16-alpine >/dev/null
trap 'docker rm -f "$NAME" >/dev/null 2>&1' EXIT
# -h 127.0.0.1: the image's first-boot setup server listens on a socket only, so this waits for the real server
until docker exec "$NAME" pg_isready -h 127.0.0.1 -U n8n -d n8n >/dev/null 2>&1; do sleep 1; done

start=$(date +%s)
gunzip -c "$FILE" | docker exec -i "$NAME" psql -U n8n -d n8n -q >/dev/null 2>/tmp/restore-test.log || true
echo "Restored in $(( $(date +%s) - start )) s (psql messages: /tmp/restore-test.log)"

Q="select 'users', count(*) from \"user\"
   union all select 'credentials', count(*) from credentials_entity
   union all select 'workflows', count(*) from workflow_entity
   union all select 'published', count(*) from workflow_entity where \"activeVersionId\" is not null
   union all select 'executions', count(*) from execution_entity"
restored="$(docker exec "$NAME" psql -U n8n -d n8n -At -F' ' -c "$Q")"
live="$(docker compose exec -T postgres psql -U n8n -d n8n -At -F' ' -c "$Q")"

printf '\n%-12s %10s %10s\n' table backup live
paste -d' ' <(echo "$restored") <(echo "$live" | awk '{print $2}') | while read -r t b l; do
  printf '%-12s %10s %10s\n' "$t" "$b" "$l"
done
echo
echo "Executions in 'live' are higher by the runs made since the backup. Everything else should match."
echo "Throwaway container removed. The live system was not touched."
