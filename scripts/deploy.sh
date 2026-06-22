#!/usr/bin/env bash
#
# Deploy confiável do OneVox para produção na Vercel.
#
# Por que este script existe:
#   - O build da nuvem da Vercel trava no plano grátis (1 slot de build).
#   - O `vercel build` local NÃO injeta as VITE_* no bundle do Vite
#     (gera frontend com tela navy / Supabase undefined).
#   - O `npm run build` direto LÊ o `.env` da raiz (via envDir:'..') e injeta certo.
#
# Estratégia: buildar o frontend com npm (env correto) + gerar functions/config
# com `vercel build`, sobrescrever o static pelo dist correto, e subir prebuilt
# (pulando a fila de build da nuvem).
#
set -euo pipefail
cd "$(dirname "$0")/.."

SCOPE="cassianopbs-projects"

echo "==> 1/4 build do frontend (com .env via Vite)"
rm -rf web/dist
npm run build --workspace=web

echo "==> 2/4 vercel build (gera functions + config)"
rm -rf .vercel/output
vercel build --prod --scope "$SCOPE"

echo "==> 3/4 sobrescreve static pelo dist com env injetado"
rm -rf .vercel/output/static
cp -r web/dist .vercel/output/static
# sanity check: a URL do Supabase precisa estar no bundle
if ! grep -rq "supabase.co" .vercel/output/static/assets/*.js; then
  echo "ERRO: VITE_SUPABASE_URL não está no bundle. Abortando." >&2
  exit 1
fi

echo "==> 4/4 deploy prebuilt (pula fila de build da nuvem)"
vercel deploy --prebuilt --prod --scope "$SCOPE"

echo "==> OK. Confirme com: curl -s https://onevox-mobile.vercel.app/ | grep -o '<title>[^<]*</title>'"
echo "    (deve mostrar <title>OneVox</title>, não 'Deployment is building')"
