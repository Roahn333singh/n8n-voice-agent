#!/usr/bin/env bash
# Run on the OLD server (single 'docker run' container named n8n).
# Exports all workflows and credentials. Credentials stay encrypted with the OLD N8N_ENCRYPTION_KEY.
set -euo pipefail

OUT="${1:-$HOME/n8n-migration}"
mkdir -p "$OUT"
chmod 700 "$OUT"

sudo docker exec -u node n8n n8n export:workflow --all --output=/tmp/m-workflows.json
sudo docker exec -u node n8n n8n export:credentials --all --output=/tmp/m-credentials.json
sudo docker cp n8n:/tmp/m-workflows.json "$OUT/workflows.json"
sudo docker cp n8n:/tmp/m-credentials.json "$OUT/credentials.json"
sudo docker exec -u root n8n rm -f /tmp/m-workflows.json /tmp/m-credentials.json
sudo chown "$USER" "$OUT"/*.json
chmod 600 "$OUT"/*.json

echo "Exported to $OUT"
echo "Next: copy the OLD N8N_ENCRYPTION_KEY into the new server's .env, then run scripts/import.sh there."
echo "Read the old key with:  sudo docker exec n8n printenv N8N_ENCRYPTION_KEY   (do not paste it into chats)"
