# OneVox — Plano de Implementacao (POC)

> Plano detalhado de como o sistema vai funcionar e em que ordem construir.
> Complementa `docs/ARQUITETURA.md`, `docs/SEGURANCA.md`, `docs/MEDICAO-USO.md`.
> Atualizado: 2026-06-20.

## 1. Objetivo da POC

Ter, ponta a ponta: paciente faz login -> digita/fala -> (correcao opcional) ->
ouve a resposta na **propria voz clonada** -> uso registrado por usuario. Tudo
com chaves protegidas no backend e com o ambiente provisionado de forma automatizada.

## 2. Decisoes ja fechadas (resumo)

- **Distribuicao:** botao "Acessar/Baixar plataforma" no site da empresa -> app em
  subdominio dedicado (`app.onevox.com`). PWA instalavel; login e o gate.
- **Contas (POC):** criadas manualmente pela equipe (casa com o onboarding manual
  da voz). Auto-cadastro + pagamento self-serve fica para depois (ja habilitado
  pela medicao de uso).
- **Stack:** PWA (React+Vite) + Vercel Functions (proxy) + Supabase (Auth/Postgres)
  + OpenAI (correcao) + ElevenLabs (TTS voz clonada) + STT (AssemblyAI/Scribe).
- **3 modos:** literal / correcao+conferir / correcao automatica.
- **Icone do app:** onda de audio OneVox (variante A1) em `brand/icons/` (copiar pra
  `web/public/` no scaffold). Emblema One AI = marca da empresa.

## 3. Estrutura do repositorio (alvo)

```
onevox-mobile/
├── CLAUDE.md  CONTEXT.md  TODO.md  PLAN.md
├── .env.example  .gitignore
├── docs/                     # arquitetura, seguranca, medicao, diagrama
├── web/                      # Frontend PWA (React + Vite)
│   ├── src/
│   │   ├── pages/            # Login, App (teclado), Frases, Perfil, Config
│   │   ├── lib/api.ts        # cliente da NOSSA API (injeta JWT do Supabase)
│   │   ├── lib/supabase.ts   # client Supabase (so anon key)
│   │   └── audio/            # gravacao + player
│   ├── vite.config.ts        # VitePWA (manifest + workbox)
│   └── public/icons/         # icones PWA 72..512 + maskable
├── api/                      # Vercel Functions (backend/proxy)
│   ├── _lib/                 # auth (valida JWT), supabaseAdmin, pricing, log de uso
│   ├── tts.ts                # texto -> ElevenLabs (voz do usuario) -> audio
│   ├── correcao.ts           # texto -> OpenAI -> texto corrigido
│   └── stt.ts                # audio -> STT -> texto (fase posterior)
└── supabase/
    └── migrations/           # SQL versionado (tabelas + RLS)
```

Monorepo simples: `web/` (frontend publico) e `api/` (backend com segredos),
deployados juntos na Vercel.

## 4. Modelo de dados (Supabase)

Conforme `docs/MEDICAO-USO.md`: tabelas `perfis` (com `elevenlabs_voice_id` e
`modo_preferido`) e `uso` (um evento por chamada externa, com custo estimado).
RLS ligada: cada usuario le so as proprias linhas; backend escreve com `service_role`.

## 5. Contrato das rotas da API (Vercel Functions)

Todas exigem `Authorization: Bearer <jwt do Supabase>` (exceto health). O backend
valida o JWT, extrai o `user_id`, e registra uso quando chama servico externo.

| Rota | Metodo | Entrada | Faz | Saida |
|---|---|---|---|---|
| `/api/correcao` | POST | `{ texto }` | OpenAI corrige (conservador) | `{ texto_corrigido }` + loga uso |
| `/api/tts` | POST | `{ texto, modo }` | busca `voice_id` do usuario na sessao -> ElevenLabs | audio (mp3) + loga uso |
| `/api/stt` | POST | audio | STT -> texto (fase posterior) | `{ texto }` + loga uso |
| `/api/health` | GET | - | status (sem segredo) | `{ ok, deps }` |

Regra de ouro: `voice_id` SEMPRE vem do perfil do usuario logado, nunca do payload.

### Como os 3 modos se traduzem em chamadas

- **Modo 1 (literal):** front chama direto `/api/tts` com o texto cru.
- **Modo 2 (correcao + conferir):** front chama `/api/correcao` -> mostra o texto
  corrigido pro paciente conferir/editar -> ao confirmar, chama `/api/tts`.
- **Modo 3 (automatico):** front chama `/api/correcao` e em seguida `/api/tts` sem parar.

(Opcional de otimizacao futura: uma rota unica que encadeia correcao+tts no backend
pra reduzir latencia do Modo 3.)

## 6. Provisionamento automatizado (minima friccao)

Sequencia que o Claude executa, apos a **autenticacao inicial unica** do usuario:

1. **Auth inicial (uma vez):**
   - Supabase: `supabase login` (ou `SUPABASE_ACCESS_TOKEN` em env) + ref do projeto.
   - Vercel: `vercel login` (ou `VERCEL_TOKEN` em env).
   - Tokens guardados como env vars locais, nunca no git.
2. **Supabase:** criar projeto -> aplicar `supabase/migrations` (tabelas + RLS) ->
   pegar URL + anon key + service_role.
3. **Vercel:** criar projeto -> setar env vars (OPENAI, ELEVENLABS, SUPABASE_*,
   STT, CORS_ORIGIN) via CLI -> deploy.
4. **Dominio:** apontar `app.onevox.com` pro projeto Vercel.

Tudo reproduzivel (provisionamento-as-code). Se houver MCP de Supabase/Vercel na
sessao, usar; senao, CLI.

## 7. Fases de construcao (milestones)

| Fase | Entrega | Pronto quando |
|---|---|---|
| 0. Setup | git init + scaffold `web/` e `api/` + provisionamento Supabase/Vercel | `vercel dev` sobe local; `/api/health` responde |
| 1. Auth | Login Supabase no PWA + perfil + guard nas rotas | Usuario loga e so acessa logado |
| 2. Texto -> Voz | `/api/tts` com voz clonada (Modo 1) | Digita -> ouve na propria voz |
| 3. Correcao + modos | `/api/correcao` + UI dos 3 modos + tela de conferir | Os 3 modos funcionam |
| 4. Medicao | log em `uso` a cada chamada + calculo de custo | Cada chamada gera linha em `uso` |
| 5. Audio -> Texto | `/api/stt` + gravacao no PWA | Fala -> transcreve -> entra no fluxo |
| 6. PWA + polish | manifest/icones/install + frases rapidas + acessibilidade | Instalavel no celular; frases rapidas e config de modo |

Onboarding da voz (criar o `voice_id` no ElevenLabs) e **manual** pela equipe nesta
fase; automatizar depois.

## 8. Riscos e pontos de atencao

- **Latencia** (texto -> correcao -> TTS): usar streaming do ElevenLabs (modelos
  Flash) no Modo automatico; Modo conferir tolera mais.
- **Correcao mudar o sentido:** prompt conservador + Modo 2 como padrao inicial.
- **iOS:** instalar PWA e manual (Compartilhar -> Adicionar a Tela); audio so toca
  apos gesto do usuario. Desenhar a UI sabendo disso.
- **Custo:** rate limit por usuario + (futuro) teto diario via dados de `uso`.
- **Precos dos fornecedores mudam:** manter a tabela em `docs/MEDICAO-USO.md`.

## 9. O que NAO entra na POC

- Auto-cadastro e pagamento self-serve (decisao adiada).
- Automacao do clone de voz pela plataforma.
- Tabela `conversas`/historico persistente (avaliar com cuidado de privacidade).
