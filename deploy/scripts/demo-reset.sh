#!/usr/bin/env bash
# Before a demo: reset the demo spreadsheet and check that every part of the system is ready.
#   sudo ./scripts/demo-reset.sh           reset the sheet, then run all checks
#   sudo ./scripts/demo-reset.sh --check   only run the checks, change nothing
# From your Mac:
#   ssh -i ~/.ssh/id_ed25519 your-user@YOUR_SERVER_IP 'sudo /opt/voice-agent/scripts/demo-reset.sh'
set -uo pipefail
cd "$(dirname "$0")/.."

MODE=reset
[ "${1:-}" = "--check" ] && MODE=check
BACKUP_DIR="${BACKUP_DIR:-/var/backups/voice-agent}"
WORKFLOW_ID=TXLzcvYVqXg831DW
ERROR_WORKFLOW_ID=vaErrorAlerts001
DOMAIN="$(grep '^DOMAIN=' .env | cut -d= -f2)"
FAIL=0
ok()  { echo "  [OK] $*"; }
bad() { echo "  [!!] $*"; FAIL=1; }
sql() { docker compose exec -T postgres psql -U n8n -d n8n -At -c "$1"; }

echo "== Server"
for svc in postgres n8n caddy; do
  id="$(docker compose ps -q "$svc")"
  if [ -z "$id" ]; then bad "$svc container is not running"; continue; fi
  state="$(docker inspect -f '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{end}}' "$id")"
  case "$state" in "running healthy"|"running ") ok "$svc: $state" ;; *) bad "$svc: $state" ;; esac
done
code="$(curl -s -o /dev/null -w '%{http_code}' "https://$DOMAIN/healthz")"
[ "$code" = 200 ] && ok "https://$DOMAIN/healthz = 200" || bad "https://$DOMAIN/healthz = $code"
used="$(df --output=pcent / | tail -1 | tr -dc '0-9')"
[ "$used" -lt 80 ] && ok "disk ${used}% used" || bad "disk ${used}% used (clean up before the demo)"
latest="$(ls -t "$BACKUP_DIR"/n8n-db-*.sql.gz 2>/dev/null | head -1)"
if [ -n "$latest" ] && [ -n "$(find "$latest" -mmin -1560)" ]; then
  ok "latest backup: $(basename "$latest")"
else
  bad "no backup from the last 26 hours in $BACKUP_DIR"
fi

echo "== n8n"
while IFS='|' read -r name active published; do
  [ "$active" = t ] && [ "$published" = t ] && ok "workflow '$name' active + published" || bad "workflow '$name' active=$active published=$published"
done < <(sql "select name, active, (\"activeVersionId\" is not null) from workflow_entity where id in ('$WORKFLOW_ID','$ERROR_WORKFLOW_ID') order by name")
recent="$(sql "select string_agg(status, ' ') from (select status from execution_entity where \"workflowId\"='$WORKFLOW_ID' order by id desc limit 5) s")"
case "$recent" in *error*|*crashed*|"") bad "last 5 runs: ${recent:-none}" ;; *) ok "last 5 runs: $recent" ;; esac
code="$(curl -s -o /dev/null -w '%{http_code}' -X POST "https://$DOMAIN/webhook/dograh-call-completed" -H 'Content-Type: application/json' -d '{}')"
[ "$code" = 403 ] && ok "Call Completed webhook is live and rejects requests without the secret (403)" || bad "Call Completed webhook answered $code (expected 403)"

echo "== Google Sheets + Dograh ($MODE)"
CRED_FILE=/tmp/demo-reset-creds.json
cleanup() { docker compose exec -T n8n rm -f "$CRED_FILE" >/dev/null 2>&1; }
trap cleanup EXIT
docker compose exec -T -u node n8n n8n export:credentials --all --decrypted --output="$CRED_FILE" >/dev/null 2>&1
docker compose exec -T n8n cat "$CRED_FILE" | python3 scripts/demo_reset.py "$MODE" "$BACKUP_DIR" || FAIL=1

echo
if [ "$FAIL" = 0 ]; then
  echo "READY FOR THE DEMO. To call: set one Hold row with permission Yes to Pending."
else
  echo "NOT READY: fix the [!!] lines above first."
fi
exit "$FAIL"
