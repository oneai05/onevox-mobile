# OneVox Mobile

Plataforma externa de comunicacao assistiva (AAC) para pacientes com dificuldade de
fala. Input por audio (transcrito) ou texto -> correcao opcional (OpenAI) -> voz
clonada do paciente (ElevenLabs) -> toca no app (PWA instalavel, sem loja).

> **One AI** (by Worth IT) e a empresa; **OneVox** e o produto.

## Por onde comecar (ordem de leitura)

1. [`CONTEXT.md`](CONTEXT.md) — estado atual e decisoes tomadas (com o porque).
2. [`PLAN.md`](PLAN.md) — plano de implementacao da POC (estrutura, rotas, fases).
3. [`docs/EXECUCAO.md`](docs/EXECUCAO.md) — **runbook passo a passo**: e por aqui
   que se comeca a construir/subir o ambiente.
4. [`TODO.md`](TODO.md) — proximos passos.

## Documentacao

| Doc | Conteudo |
|---|---|
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Componentes, fluxo de dados, 3 modos, provisionamento |
| [docs/SEGURANCA.md](docs/SEGURANCA.md) | Chaves so no backend, frontend publico, auth, RLS |
| [docs/MEDICAO-USO.md](docs/MEDICAO-USO.md) | Schema Supabase, custo por usuario, base p/ cobranca |
| [docs/DESIGN.md](docs/DESIGN.md) | Design system (paleta, botoes, acessibilidade) |
| [docs/TELAS.md](docs/TELAS.md) | Telas e fluxo de navegacao |
| [docs/fluxo-dados.png](docs/fluxo-dados.png) | Diagrama do fluxo de dados |
| [brand/](brand/README.md) | Logo, icones, paleta |

## Stack

PWA (React + Vite) + Vercel Functions (proxy seguro) + Supabase (Auth/Postgres) +
OpenAI (correcao) + ElevenLabs (TTS voz clonada) + STT (AssemblyAI/Scribe).

## Regra de ouro

Chaves de API **so no backend**, nunca no frontend, nunca no git. `.env` e
gitignored; usar [`.env.example`](.env.example) como referencia.

## Comecar a desenvolver

Pre-requisitos e comandos completos em [`docs/EXECUCAO.md`](docs/EXECUCAO.md).
Resumo: `npm i -g supabase vercel` -> `supabase login` + `vercel login` ->
preencher `.env` -> aplicar `supabase/migrations/` -> `vercel dev`.
