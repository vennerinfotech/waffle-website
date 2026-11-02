#!/usr/bin/env bash
set -e

# ==============================================================================
# Waffle Castle — Automated Deployment Script
# Usage:
#   ./deploy.sh          # Deploy local changes (build & restart PM2)
#   ./deploy.sh --pull   # Pull latest changes from git branch and deploy
# ==============================================================================

# Set environment PATH
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=============================================="
echo "🚀 Starting Deployment: Waffle Castle"
echo "📂 Project Directory: $SCRIPT_DIR"
echo "⏰ Time: $(date)"
echo "=============================================="

# 1. Optionally pull latest changes from git
if [ "$1" == "--pull" ]; then
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
  echo ""
  echo "📥 [1/4] Pulling latest changes from branch: $CURRENT_BRANCH..."
  git pull origin "$CURRENT_BRANCH"
else
  echo ""
  echo "ℹ️  [1/4] Skipping git pull (use './deploy.sh --pull' to pull latest changes)"
fi

# 2. Install dependencies
echo ""
echo "📦 [2/4] Installing dependencies..."
npm install --legacy-peer-deps --no-audit --no-fund

# 3. Build Next.js project
echo ""
echo "🏗️  [3/4] Building Next.js production build..."
npm run build

# 4. Restart/Reload PM2 process
echo ""
echo "🔄 [4/4] Reloading PM2 process..."
PM2_APP_NAME="wafflecastle"
PORT_NUM=5050

if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
    echo "♻️  Reloading existing PM2 process: $PM2_APP_NAME..."
    pm2 restart "$PM2_APP_NAME" --update-env
else
    echo "▶️  Starting new PM2 process: $PM2_APP_NAME on port $PORT_NUM..."
    pm2 start npm --name "$PM2_APP_NAME" --cwd "$SCRIPT_DIR" -- start -- -p "$PORT_NUM"
fi

pm2 save

echo ""
echo "=============================================="
echo "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "🌐 URL: https://wafflecastle.in"
echo "🔌 Local Port: $PORT_NUM"
echo "💡 Note: Perform a hard refresh in your browser (Ctrl + F5 or Cmd + Shift + R)."
echo "=============================================="
