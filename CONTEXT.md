# Context — OneVox Mobile
> Atualizado: 2026-06-22

## Estado atual

🟢 **POC NO AR.** Fases 0-3 + miolo importado do colega, deployado em produção.

- **URL pública:** https://onevox-mobile.vercel.app (instalável, sem bloqueio SSO)
- Auth, login, AppShell, Teclado, **Frases**, **Gravar**, **Perfil** funcionando.
- TTS (ElevenLabs) + correção (OpenAI) + **STT (OpenAI Whisper)** validados ponta-a-ponta.
- **Gravar (Fase 5):** MediaRecorder → `/api/stt` (gpt-4o-mini-transcribe, pt) → texto
  editável → Falar / Corrigir e Falar. Hook `useFala` compartilhado com o Teclado.
- **Dois modos de correção** (`perfis.modo_preferido`: 1=conservador, 2=reconstrução),
  escolhidos no Perfil. Backend lê o modo do perfil (nunca do payload). Prompt de
  reconstrução adaptado do colega (decodifica texto truncado de quem tem ELA).
- **Frases prontas** (16 em 4 categorias) na tabela `frases` do Supabase (RLS própria,
  seed na 1ª carga). **Botões Sim/Não** no Teclado. **Botão flutuante** de compartilhar
  áudio (Web Share API + fallback download). **Tamanho de fonte** (`perfis.font_scale`).
- `/api/health` → `{supabase:true, openai:true, elevenlabs:true}`.
- Voz "Cassiano" (`ZhHddHRyxDXlhs2YdQUR`) no perfil de teste.
- **Medição de uso por usuário:** custo (USD) calculado por chamada em `api/_lib/precos.ts`
  e gravado em `uso.custo_usd` pelo `logUso`. View **`uso_resumo`** agrega consumo+custo
  por usuário (revogada p/ anon — relatório só via service_role/painel). Validado em produção.
- **Migrations 0002** (frases + font_scale) e **0003** (view uso_resumo) aplicadas.
- **`scripts/criar-testadores.mjs`:** provisiona usuários de teste (`nome@onevox.app` + senha
  gerada) e amarra a `elevenlabs_voice_id` de cada um. Entrada: `scripts/testadores.json` (gitignored).

## Como rodar local

```bash
# UM único terminal (vercel dev sobe API + frontend)
cd ~/Documents/onevox-mobile
vercel dev
```

Acessa **http://localhost:3000** (porta do vercel dev, não 5173).
Login: `teste@onevox.com` / `onevox123`

> Se abrir um segundo terminal com `npm run dev`, vai conflitar (porta 5173 em uso → vai para 5174, mas o proxy vai apontar para 3000 errado). Use só o `vercel dev`.

## Última sessão — 2026-06-22 (noite)

- Trabalhando em: **corrigir tela navy em produção + confirmar install no celular**
- Feito:
  - **Causa da tela navy:** bundle de produção sem `VITE_SUPABASE_URL` (0 ocorrências no JS). O `vercel build` não injeta as `VITE_*`; só `npm run build` direto injeta. Confirmado baixando o bundle e fazendo `grep zmuiwfvoyfqpnbaxwcss`.
  - **Fix do deploy:** buildar frontend com `npm run build --workspace=web` → sobrescrever `.vercel/output/static` pelo `web/dist` correto → `vercel deploy --prebuilt`. Bundle final `index-CIx_OBGS.js` com a URL embutida; `<title>OneVox</title>` no ar.
  - **Fila travou de novo** (1 deploy passa por vez): zerar TUDO com `vercel remove $(ls) --yes` e redeployar uma vez resolve.
  - **Criado `scripts/deploy.sh`** encapsulando o pipeline + sanity check `grep supabase.co`.
  - **Celular:** usuário instalou o PWA e confirmou funcionando (login + correção + voz). ⚠️ Quem instalou com build quebrado precisa desinstalar/reinstalar (cache do Service Worker).
  - **Esclarecido git vs deploy:** nosso deploy é `vercel deploy --prebuilt` (sobe do PC, NÃO via git push). git/GitHub é só backup/histórico, independente do que está no ar.
- Depois (mesma sessão): **importado o miolo do colega** (repo `oneai05/onevox-mobile`,
  ref em `~/Documents/ref-oneai05`, stack RN/Expo — só lógica/conteúdo portado):
  - 2 modos de correção (Perfil escolhe; backend `api/correcao.ts` lê `modo_preferido`)
  - Frases prontas no Supabase (`Frases.tsx` + migration 0002 + RLS)
  - Botão flutuante de compartilhar (`components/FloatingShareButton.tsx`, Web Share API)
  - Botões Sim/Não no Teclado; tamanho de fonte (`usePerfil` + `applyFontScale`)
  - Hook `web/src/lib/usePerfil.ts` (lê/grava perfil via RLS)
  - **Bug do deploy.sh corrigido:** `vercel build` re-rodava o frontend e clobberava o
    web/dist sem env → reordenado (npm build por último). Sanity check agora usa a URL real.
- Depois (mesma sessão): **Fase 5 — Gravar (STT)** implementada e deployada:
  - `api/stt.ts`: recebe áudio base64 → OpenAI Whisper (`gpt-4o-mini-transcribe`, pt) → texto.
    Round-trip validado (TTS→Whisper retorna a frase exata). logUso `operacao='stt'`.
  - `Gravar.tsx`: MediaRecorder (webm/mp4 conforme navegador), auto-parar 60s, transcrição
    editável + Falar/Corrigir e Falar; trata negação de microfone.
  - `useFala` (novo hook): extrai falar/corrigirEFalar/ultimoAudio do Teclado; Teclado e
    Gravar usam o mesmo. Teclado refatorado sem mudança de comportamento.
- Depois (mesma sessão): **medição de uso por usuário** (Fase 4):
  - `api/_lib/precos.ts` + `logUso` calculam e gravam `custo_usd` por chamada (validado:
    correção em produção gravou US$0.000092). View `uso_resumo` (migration 0003) p/ relatório.
  - `scripts/criar-testadores.mjs` pronto p/ criar testadores com voz própria.
  - Preços preenchidos em `docs/MEDICAO-USO.md` (estimativas — ajustar ao faturamento real).
- Parou em: **Fases 0-5 + medição no ar.** Aguardando o usuário criar as vozes no ElevenLabs
  e mandar nome+voice_id de cada testador → rodar o script de provisionamento.

## Deploy — playbook (resolvido)

**Use o script:** `./scripts/deploy.sh` — encapsula todo o pipeline correto.

**Duas armadilhas que esse script resolve:**

1. **Tela navy / Supabase undefined:** o `vercel build` local NÃO injeta as `VITE_*`
   no bundle do Vite (gera frontend quebrado, só fundo navy). Só `npm run build`
   direto lê o `.env` da raiz (via `envDir:'..'`) e injeta. Por isso o script builda
   o frontend com npm e **sobrescreve** `.vercel/output/static` pelo `web/dist` correto
   antes do `vercel deploy --prebuilt`.
   **ORDEM IMPORTA:** o `vercel build` roda o buildCommand (`npm run build`) e SOBRESCREVE
   `web/dist` SEM as `VITE_*`. Então o `npm run build` "bom" tem que ser o ÚLTIMO a tocar
   `web/dist` (depois do `vercel build`), e só então copiado pro static. Sanity check usa a
   URL REAL do projeto (`zmuiwfvoyfqpnbaxwcss`), não `supabase.co` (que casa com a lib e dá
   falso-positivo).

2. **Fila de build travada:** build da nuvem trava no free tier (1 slot). O `--prebuilt`
   pula isso. Mas só **1 deploy passa por vez após a fila estar zerada** — se sobrar um
   deploy anterior ocupando o slot, o novo trava em "Deployment is building".
   Fix: `vercel ls onevox-mobile | grep -oE 'onevox-mobile-[a-z0-9]+...' | sort -u | xargs vercel remove --yes`
   (zera TUDO) e redeployar uma vez.

**Não confiar em `vercel ls`** (CLI v54 mostra tudo `UNKNOWN` — bug). Confirmar com
o `<title>` da home: `OneVox` = ok; `Deployment is building` = travado.

## ⚠️ Cache do PWA no celular

Quem instalou o PWA com um build quebrado tem o Service Worker servindo o bundle
velho do cache. `registerType:'autoUpdate'` atualiza, mas pode exigir fechar e
reabrir o app 1-2x. Garantido: desinstalar o ícone → reabrir a URL no navegador →
reinstalar.

## Quirks conhecidos do ambiente

- **`vercel dev` já roda o frontend:** detecta o `devCommand` salvo nos settings do projeto na Vercel (mesmo que não esteja no `vercel.json` local). Não precisa de segundo terminal.
- **Porta correta:** acessar `localhost:3000` (porta do `vercel dev`), não `localhost:5173`.
- **`vercel ls` mostra UNKNOWN:** bug do CLI v54 — não reflete o estado real dos builds na nuvem.
- **`envDir: '..'` no vite.config.ts:** necessário para Vite encontrar o `.env` na raiz do monorepo ao rodar de dentro de `web/`.

## Decisões técnicas

| Decisão | Justificativa | Data |
|---------|--------------|------|
| npm workspaces (root) | Deps de `web/` e `api/` resolvidas a partir da raiz; sem duplicação | 2026-06-20 |
| Vercel Functions runtime Node.js | Streaming de áudio; Edge não suporta Buffer nativo | 2026-06-20 |
| Rate limit em Map em memória | Simples para POC; muda para Redis/Supabase depois | 2026-06-20 |
| Supabase MCP para provisionamento | Projeto + migration aplicados sem intervenção manual | 2026-06-20 |
| `VITE_SUPABASE_URL/ANON_KEY` (prefixo VITE_) | Vite só expõe ao bundle vars com prefixo VITE_ | 2026-06-20 |
| `devCommand` removido do vercel.json | vercel dev v54 trava functions em background; mas o devCommand persiste nos settings da Vercel na nuvem | 2026-06-21 |
| `envDir: '..'` no vite.config.ts | Vite rodando em `web/` precisa achar `.env` na raiz do monorepo | 2026-06-21 |
| `npm run build --workspace=web` no buildCommand | Evita duplo npm install que travava o build na nuvem da Vercel | 2026-06-21 |
| `vercel build` local + `vercel deploy --prebuilt` | Bypassa build na nuvem (que trava); build local leva ~4s | 2026-06-21 |
| ElevenLabs multilingual v2 | Suporta português nativamente com qualquer voz | 2026-06-21 |
| OpenAI gpt-4o-mini, temperature=0 | Correção conservadora, sem criatividade | 2026-06-21 |
| voice_id sempre do banco (nunca do payload) | Segurança: cliente não pode escolher voz arbitrária | 2026-06-21 |
| Deploy via `scripts/deploy.sh` (CLI prebuilt), NÃO via git push | Build da nuvem trava na fila; prebuilt sobe do PC direto. git/GitHub é só backup, desacoplado do deploy | 2026-06-22 |
| Override de `.vercel/output/static` pelo `web/dist` do npm | `vercel build` não injeta `VITE_*` no bundle → tela navy; só `npm run build` injeta | 2026-06-22 |

## Dados do projeto Supabase
- Projeto: `onevox` | Ref: `zmuiwfvoyfqpnbaxwcss` | Região: `sa-east-1`
- URL: `https://zmuiwfvoyfqpnbaxwcss.supabase.co`
- Usuário de teste: `teste@onevox.com` / `onevox123` | voice: Cassiano (`ZhHddHRyxDXlhs2YdQUR`)

## Dados do projeto Vercel
- Projeto: `onevox-mobile` | Org: `cassianopbs-projects`
- Repo GitHub: `cassianopb/onevox-mobile`
- Dashboard: https://vercel.com/cassianopbs-projects/onevox-mobile

## Arquitetura (resumo)

```
PWA (React+Vite, instalável)  — web/
   | HTTPS
Vercel Functions (proxy seguro) — api/
   |-- /api/tts        → ElevenLabs (voice_id do perfil no Supabase)
   |-- /api/correcao   → OpenAI gpt-4o-mini (prompt conservador)
   |-- /api/stt        → stub 501 (Fase 5)
   |-- /api/health     → healthcheck
Supabase: Auth + perfis (elevenlabs_voice_id, modo) + uso (log)
```
