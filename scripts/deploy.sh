#!/usr/bin/env bash
# Deploy production cho saokim-3d.davidtung.net (systemd game-3d, port 8789).
#   ./scripts/deploy.sh            # typecheck + build + restart + verify
#   ./scripts/deploy.sh --fast     # bỏ typecheck
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export PATH="/home/tungphan/.nvm/versions/node/v24.19.0/bin:$PATH"

SUDO=""
[ "$(id -u)" -ne 0 ] && SUDO="sudo -n"

echo "→ commit nguồn mới nhất:"
find src index.html -type f -printf '%TH:%TM %p\n' | sort -r | head -3

if [ "${1:-}" != "--fast" ]; then
  echo "→ typecheck"
  npm run typecheck
fi

echo "→ build"
npm run build 2>&1 | grep -E "modules transformed|built in|precache|error" || true

echo "→ restart game-3d"
$SUDO systemctl restart game-3d

for i in $(seq 1 20); do
  if curl -sf -m 2 http://127.0.0.1:8789/api/health >/dev/null; then break; fi
  sleep 1
done

echo "→ health"
curl -s -m 5 http://127.0.0.1:8789/api/health; echo

API_PUBLIC="$(curl -s -m 10 https://saokim-3d.davidtung.net/ | grep -oE '/assets/index-[A-Za-z0-9_-]+\.js' | head -1 || true)"
echo "→ bundle đang phục vụ: ${API_PUBLIC:-KHÔNG THẤY}"
[ -n "$API_PUBLIC" ] && curl -s -o /dev/null -w "   ${API_PUBLIC} → %{http_code} %{size_download}B\n" -m 15 "https://saokim-3d.davidtung.net${API_PUBLIC}"
echo "→ nhớ hard-reload / xoá PWA cache ở client khi sw.js đổi."
