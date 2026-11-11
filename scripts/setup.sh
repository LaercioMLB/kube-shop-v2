#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
docker run --rm --user "$(id -u):$(id -g)" \
  --mount "type=bind,source=$(pwd),target=/workspace" \
  --workdir /workspace node:24.15.0-alpine3.23 node scripts/setup.mjs
