#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../utils.sh"
cd "${CI_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"

log "unit tests"
npm test

trap nginx_serve_cleanup EXIT
nginx_serve_image
for path in / /sitemap.xml /static/game.css; do
  curl -fsS -o /dev/null "$CI_SERVE_URL$path" || die "$path is not served"
done
log "image serves the game"
