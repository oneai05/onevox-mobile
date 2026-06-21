# TODO — OneVox Mobile
> Atualizado: 2026-06-20

Documentacao, design e marca: concluidos. A partir daqui, executar na outra maquina
seguindo `docs/EXECUCAO.md`.

## 🔥 Agora (na maquina de desenvolvimento)
- [ ] `git init` + primeiro commit (com `.gitignore` valendo) e push pro remoto
- [ ] Auth inicial: `supabase login` + `vercel login` (ou tokens em env)
- [ ] Preencher `.env` a partir de `.env.example` (chaves OpenAI/ElevenLabs/Supabase)
- [ ] Provisionar Supabase (criar projeto + `supabase db push` aplica `supabase/migrations/`)
- [ ] Provisionar Vercel (criar projeto + env vars + deploy)
- [ ] Scaffold do monorepo (`web/` + `api/`) conforme `PLAN.md`, aplicando `docs/DESIGN.md`
      (copiar `brand/icons/` + `brand/onevox-mark.png` pra `web/public/`)

## 📋 Em breve
- [ ] Rotas da API: `/auth`, `/tts` (texto -> voz), `/correcao`
- [ ] Fluxo texto -> (correcao opcional) -> TTS voz clonada ponta a ponta
- [ ] Decidir STT (AssemblyAI vs ElevenLabs Scribe) testando com audio real
- [ ] Preencher tabela de precos OpenAI/ElevenLabs em `docs/MEDICAO-USO.md`

## 💡 Backlog
- [ ] Fluxo audio -> STT
- [ ] Tabela `conversas` (historico) + politica de retencao
- [ ] Modelo de contas: auto-cadastro + pagamento self-serve (decisao adiada)
- [ ] Diagrama visual do fluxo de telas (opcional, com a marca)
