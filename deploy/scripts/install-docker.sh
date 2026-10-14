#!/usr/bin/env bash
# Installs Docker Engine + the Compose plugin on a fresh Debian/Ubuntu server.
set -euo pipefail

if docker compose version >/dev/null 2>&1; then
  echo "Docker and Docker Compose are already installed."
  exit 0
fi

if command -v docker >/dev/null 2>&1; then
  echo "Docker is installed but the Compose plugin is missing."
  echo "Debian 13:  sudo apt-get update && sudo apt-get install -y docker-compose"
  echo "Otherwise:  follow https://docs.docker.com/engine/install/ to install Docker CE with docker-compose-plugin."
  exit 1
fi

curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
echo "Docker installed. Log out and back in so 'docker' works without sudo."
