# Context — OneVox Mobile
> Atualizado: 2026-06-21

## Estado atual

Fases **0 e 1 concluídas**. Ambiente local funcional. Vercel provisionada.

- Monorepo `web/` + `api/` criado e rodando.
- Supabase provisionado (`onevox`, `sa-east-1`), migration aplicada, RLS ativa.
- Vercel linkada ao GitHub (`cassianopb/onevox-mobile`), env vars configuradas nos 3 ambientes.
- Frontend confirmado funcionando em `localhost:5173` (screenshot de login recebido).
- Login redesenhado: ícone OneVox grande + "Powered by One AI" no rodapé.
- Usuário de teste criado: `teste@onevox.com` / `onevox123`.
- **Pendente:** confirmar login funcionando + primeiro `git push` para deploy na Vercel.

## Última sessão — 2026-06-21

- Trabalhando em: provisionamento Vercel + dev local + redesign do Login.
- Feito:
  - `.env` preenchido pelo usuário (todas as chaves).
  - `vercel login` + `vercel link` (projeto `cassianopbs-projects/onevox-mobile`, conectado ao GitHub).
  - 6 env vars adicionadas à Vercel via CLI (Production + Preview + Development).
  - Descoberto e corrigido bug de recursão: `package.json` root tinha `"dev": "vercel dev"` → removido.
  - `devCommand` removido do `vercel.json` (vercel dev v54 trava API functions em background/non-TTY).
  - Vite proxy adicionado em `web/vite.config.ts`: `/api/*` → `localhost:3000`.
  - Fix CSS: autofill amarelo do browser corrigido em `index.css`.
  - Login redesenhado: ícone grande + subtítulo + footer "Powered by One AI" com emblema.
  - `brand/oneai-emblem.png` copiado para `web/public/oneai-emblem.png`.
  - Usuário de teste criado via Supabase Admin API.
- Parou em: usuário fechou os terminais; login redesenhado ainda não foi testado.

## Como rodar local

```bash
# Terminal 1 — API (Vercel Functions na porta 3000)
cd ~/Documents/onevox-mobile
vercel dev

# Terminal 2 — Frontend (Vite na porta 5173, proxy /api/* → 3000)
cd ~/Documents/onevox-mobile/web
npm run dev
```

Acesso: **http://localhost:5173**
Login de teste: `teste@onevox.com` / `onevox123`

> Nota: a autenticação (Login.tsx) vai direto ao Supabase — não depende do `vercel dev`.
> O `vercel dev` só é necessário para testar as rotas `/api/tts`, `/api/correcao` etc. (Fase 2+).

## Quirks conhecidos do ambiente

- **vercel dev v54 em background/non-TTY:** API functions ficam penduradas. Rodar sempre em terminal interativo.
- **`devCommand` removido do vercel.json:** sem ele, `vercel dev` serve só API. Frontend roda separado.
- **Porta 5174:** se 5173 estiver em uso, Vite sobe em 5174. Verificar qual porta o terminal mostra.

## Em aberto (decisões adiadas)

- Modelo de contas de longo prazo (auto-cadastro + pagamento self-serve). Revisitar após POC.
- Provedor de STT definitivo (AssemblyAI vs ElevenLabs Scribe). Decidir testando com áudio real.
- Deploy de produção em `app.onevox.com` (Fase 6).

## Decisões técnicas

| Decisão | Justificativa | Data |
|---------|--------------|------|
| npm workspaces (root) | Deps de `web/` e `api/` resolvidas a partir da raiz; sem duplicação | 2026-06-20 |
| Vercel Functions runtime Node.js | Streaming de áudio; Edge não suporta Buffer nativo | 2026-06-20 |
| Rate limit em Map em memória | Simples para POC; muda para Redis/Supabase depois | 2026-06-20 |
| Supabase MCP para provisionamento | Projeto + migration aplicados sem intervenção manual | 2026-06-20 |
| `VITE_SUPABASE_URL/ANON_KEY` (prefixo VITE_) | Vite só expõe ao bundle vars com prefixo VITE_ | 2026-06-20 |
| `devCommand` removido do vercel.json | vercel dev v54 trava functions em background; frontend roda separado com proxy | 2026-06-21 |
| Vite proxy `/api/*` → localhost:3000 | Unifica dev em localhost:5173 sem CORS; proxy só ativo em dev | 2026-06-21 |

## Dados do projeto Supabase
- Projeto: `onevox` | Ref: `zmuiwfvoyfqpnbaxwcss` | Região: `sa-east-1`
- URL: `https://zmuiwfvoyfqpnbaxwcss.supabase.co`
- Painel: https://supabase.com/dashboard/project/zmuiwfvoyfqpnbaxwcss

## Dados do projeto Vercel
- Projeto: `onevox-mobile` | Org: `cassianopbs-projects`
- Repo GitHub: `cassianopb/onevox-mobile`
- Deploy automático a cada `git push` na branch `main`

## Arquitetura (resumo)

```
PWA (React+Vite, instalável)  — web/
   | HTTPS (só a nossa API)
Vercel Functions (proxy seguro) — api/
   |-- STT (AssemblyAI / ElevenLabs Scribe)   → texto
   |-- OpenAI                                   → correção conservadora
   |-- ElevenLabs (voice_id do usuário)         → áudio (voz clonada)
Supabase: Auth + perfis (voice_id, modo) + uso (log/custo)
```
