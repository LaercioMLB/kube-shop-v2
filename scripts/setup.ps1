$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
docker run --rm --mount "type=bind,source=$projectRoot,target=/workspace" --workdir /workspace node:24.15.0-alpine3.23 node scripts/setup.mjs
if ($LASTEXITCODE -ne 0) { throw 'Falha ao preparar a configuração Docker.' }
