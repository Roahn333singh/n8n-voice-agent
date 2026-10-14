#!/usr/bin/env bash
# Imports workflows (and optionally credentials) into the running stack.
#   New client:        scripts/import.sh workflows/Voice-Agent.json
#   Moving your server: scripts/import.sh workflows.json credentials.json
# credentials.json only decrypts if .env has the SAME N8N_ENCRYPTION_KEY as the old server.
set -euo pipefail
cd "$(dirname "$0")/.."

WORKFLOWS="${1:?usage: scripts/import.sh workflows.json [credentials.json]}"
CREDENTIALS="${2:-}"

if [ -n "$CREDENTIALS" ]; then
  docker compose cp "$CREDENTIALS" n8n:/tmp/credentials.json
  docker compose exec -T -u root n8n chmod 644 /tmp/credentials.json
  docker compose exec -T -u node n8n n8n import:credentials --input=/tmp/credentials.json
  docker compose exec -T -u root n8n rm -f /tmp/credentials.json
fi

docker compose cp "$WORKFLOWS" n8n:/tmp/workflows.json
docker compose exec -T -u root n8n chmod 644 /tmp/workflows.json
docker compose exec -T -u node n8n n8n import:workflow --input=/tmp/workflows.json
docker compose exec -T -u root n8n rm -f /tmp/workflows.json

echo "Imported. Open n8n, check the credential on every node, then activate the workflow."
