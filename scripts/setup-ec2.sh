#!/bin/bash
set -euo pipefail

echo "=== Updating apt ==="
sudo apt-get update

echo "=== Installing Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "=== Installing build tools for native modules (better-sqlite3) ==="
sudo apt-get install -y build-essential python3

echo "=== Installing PM2 globally ==="
sudo npm install -g pm2

echo "=== Done ==="
echo "Clone the repo, run npm install, copy .env.example to .env, then start PM2 with:"
echo "pm2 start ecosystem.config.cjs"
