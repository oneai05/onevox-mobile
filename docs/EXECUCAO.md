# OneVox — Runbook de Execucao (passo a passo)

> Guia para montar e subir o ambiente do zero, em qualquer maquina. Pensado para
> ser seguido por uma pessoa OU por uma sessao de IA, sem depender de conversa
> anterior. Comandos podem variar de versao - se um flag falhar, rodar o
> `--help` do CLI correspondente.

## 0. Pre-requisitos (instalar uma vez na maquina)

- **Node.js LTS** (>= 20) e npm.
- **Git**.
- Contas criadas: **Supabase**, **Vercel**, **OpenAI**, **ElevenLabs** (e
  **AssemblyAI** se for usar STT pago).
- Em maos (NAO colar em chat/codigo): `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`,
  e depois as chaves do Supabase (geradas ao criar o projeto).

```bash
node -v && npm -v && git --version
npm i -g supabase vercel
```

## 1. Clonar o repositorio

```bash
git clone <url-do-repo> onevox-mobile
cd onevox-mobile
```

Se o repo ainda nao existe como git: `git init` e suba pra um remoto antes.

## 2. Variaveis de ambiente (local)

```bash
cp .env.example .env
# editar .env e preencher as chaves. O .env e gitignored - nunca commitar.
```

As chaves de producao NAO ficam no `.env` versionado: vao no painel/CLI da Vercel
(passo 5) e nos secrets do Supabase. O `.env` local serve so pra rodar em dev.

## 3. Autenticacao inicial unica (o handshake)

Isto e o unico passo que exige login manual. Depois dele, o resto e automatizavel.

```bash
supabase login      # abre o navegador OU usar: export SUPABASE_ACCESS_TOKEN=...
vercel login        # abre o navegador OU usar: export VERCEL_TOKEN=...
```

## 4. Provisionar o Supabase

```bash
# Opcao A: criar projeto novo pela CLI (ou criar pelo painel e pegar o ref)
supabase projects create onevox --org-id <ORG_ID> --region sa-east-1   # Sao Paulo

# vincular o repo ao projeto remoto
supabase link --project-ref <PROJECT_REF>

# aplicar as migrations (tabelas perfis + uso + RLS)
supabase db push
```

Anotar do painel do Supabase (Project Settings > API):
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` (frontend), `SUPABASE_SERVICE_ROLE_KEY` (backend).

## 5. Provisionar a Vercel

```bash
vercel link            # vincula a pasta a um projeto Vercel (cria se preciso)

# setar as env vars (uma por uma; escolher Production/Preview/Development)
vercel env add OPENAI_API_KEY
vercel env add ELEVENLABS_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add CORS_ORIGIN
# (ASSEMBLYAI_API_KEY quando entrar o STT)
```

## 6. Rodar local

```bash
npm install            # instala deps de web/ e api/ (conforme o scaffold)
vercel dev             # sobe frontend + functions localmente
```

Validacao: abrir `http://localhost:3000/api/health` -> deve responder `ok` com o
status das dependencias (mongo/supabase/databricks nao se aplica; aqui: supabase,
openai, elevenlabs configurados).

## 7. Deploy

```bash
vercel               # deploy de preview
vercel --prod        # deploy de producao
```

Depois, no painel da Vercel, apontar o dominio `app.onevox.com` para o projeto.

## 8. Smoke test (ponta a ponta)

1. Abrir a URL -> tela de login.
2. Logar com uma conta de teste (criada manualmente no Supabase Auth).
3. Garantir que o perfil tem um `elevenlabs_voice_id` valido (onboarding manual da voz).
4. Digitar um texto -> ouvir o audio na voz clonada (Modo 1).
5. Conferir que apareceu uma linha em `uso` no Supabase.

## 9. Checklist final

- [ ] `.env` preenchido e NAO commitado.
- [ ] Migrations aplicadas (perfis + uso + RLS ligada).
- [ ] Env vars setadas na Vercel (chaves so no backend).
- [ ] `/api/health` ok.
- [ ] Login + TTS + log de uso funcionando.
- [ ] Dominio `app.onevox.com` apontado.

> Ordem de construcao das features (fases) esta em `PLAN.md` secao 7.
