# CLAUDE.md — OneVox Mobile

## Ao iniciar qualquer sessao
1. Leia `CONTEXT.md` para entender o estado atual do projeto.
2. Leia `TODO.md` para entender prioridades.
3. Leia `PLAN.md` para o plano de implementacao da POC.
4. Para detalhes, veja `docs/`: ARQUITETURA, SEGURANCA, MEDICAO-USO, DESIGN
   (design system), TELAS (telas + navegacao), EXECUCAO (runbook passo a passo).
5. Ativos de marca em `brand/`.

## O que e o OneVox
Plataforma externa (NAO Hapvida) de comunicacao assistiva para pacientes com
dificuldade de fala. Input audio/texto -> correcao opcional (OpenAI) -> voz
clonada do paciente (ElevenLabs) -> toca no app. "OneVox" = produto, "OneAI" = empresa.

## Stack e convencoes
- Frontend: PWA (React + Vite). Tratar como **publico** — nenhum segredo no cliente.
- Backend: Vercel Functions (serverless) como **proxy seguro** — guarda todas as chaves.
- Dados/Auth: Supabase (Postgres + Auth + RLS).
- IA: OpenAI (correcao de texto), ElevenLabs (TTS voz clonada), STT (AssemblyAI/Scribe).
- Docs em PT-BR.

## Regras do projeto (nao negociaveis)
- Chaves de API **so no backend**, nunca no frontend, nunca no git. Nunca colar
  chave em chat/codigo/commit. `.env` e gitignored; usar `.env.example` como referencia.
- `SUPABASE_SERVICE_ROLE_KEY` so no backend; `anon key` pode ir no frontend (RLS protege).
- `voice_id` sempre derivado da sessao do usuario logado, nunca do payload do cliente.
- Toda rota da API exige sessao valida do Supabase; rate limit por usuario.
- Correcao de texto **conservadora**: nunca mudar o sentido nem adicionar conteudo.
- Todo uso (OpenAI + ElevenLabs) registrado por usuario no backend.

## Identidade visual
Fundo navy escuro; gradiente verde-limao #7CF2A6 -> azul ciano #34A9E0.
