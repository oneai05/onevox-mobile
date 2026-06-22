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
# ORDEM IMPORTA: o `vercel build` roda o buildCommand (npm run build) e SOBRESCREVE
# web/dist SEM as VITE_*. Por isso o build "bom" do frontend tem que ser o ÚLTIMO a
# tocar web/dist — depois do `vercel build` — e só então copiado pro static.
#
set -euo pipefail
cd "$(dirname "$0")/.."

SCOPE="cassianopbs-projects"
# Referência do projeto Supabase — usada no sanity check do bundle.
REF="zmuiwfvoyfqpnbaxwcss"

echo "==> 1/4 vercel build (gera functions + config; o static daqui é descartado)"
rm -rf .vercel/output
vercel build --prod --scope "$SCOPE"

echo "==> 2/4 build do frontend com npm (POR ÚLTIMO, com .env via Vite)"
rm -rf web/dist
npm run build --workspace=web

echo "==> 3/4 sobrescreve o static pelo dist com env injetado"
rm -rf .vercel/output/static
cp -r web/dist .vercel/output/static
# sanity check: a URL REAL do Supabase (não a lib) precisa estar no bundle
if ! grep -rq "$REF" .vercel/output/static/assets/*.js; then
  echo "ERRO: VITE_SUPABASE_URL ($REF) não está no bundle. Abortando." >&2
  exit 1
fi

echo "==> 4/4 deploy prebuilt (pula fila de build da nuvem)"
vercel deploy --prebuilt --prod --scope "$SCOPE"

echo "==> OK. Confirme o bundle de produção:"
echo "    JS=\$(curl -s https://onevox-mobile.vercel.app/ | grep -oE '/assets/index-[A-Za-z0-9_-]+\\.js' | head -1)"
echo "    curl -s https://onevox-mobile.vercel.app\$JS | grep -c $REF   # deve ser 1"
echo ""
echo "    Se algum deploy travar em 'Deployment is building', zere a fila:"
echo "    vercel ls onevox-mobile --scope $SCOPE | grep -oE 'onevox-mobile-[a-z0-9]+-cassianopbs-projects.vercel.app' | sort -u | xargs vercel remove --yes --scope $SCOPE"
echo "    e rode este script de novo."
