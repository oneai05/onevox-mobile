# TODO — OneVox Mobile
> Atualizado: 2026-06-21

## ✅ Concluido
- [x] Documentacao, design e marca
- [x] Scaffold monorepo (`web/` + `api/`) — Fases 0 + 1
- [x] Supabase provisionado (projeto `onevox`, sa-east-1, migration aplicada)
- [x] `.env` preenchido com todos os segredos
- [x] Brand assets copiados para `web/public/`
- [x] Frontend: Login + AppShell (tab bar) + Teclado + Gravar + Frases + Perfil
- [x] API: `health`, `tts`/`correcao`/`stt` (stubs 501) + auth + rate limit + logUso
- [x] Vercel linkada ao GitHub (`cassianopbs-projects/onevox-mobile`)
- [x] 6 env vars configuradas na Vercel (Production + Preview + Development)
- [x] Login redesenhado: ícone grande + wordmark + "Powered by One AI"
- [x] Fix CSS autofill amarelo do browser
- [x] Usuário de teste criado: `teste@onevox.com` / `onevox123`

## 🔥 Agora

1. **Subir terminais** (ver CONTEXT.md "Como rodar local"):
   - Terminal 1: `cd ~/Documents/onevox-mobile && vercel dev`
   - Terminal 2: `cd ~/Documents/onevox-mobile/web && npm run dev`
2. **Testar login** em `http://localhost:5173` com `teste@onevox.com` / `onevox123`
3. **Primeiro `git push`** → `git add -A && git commit -m "feat: fases 0-1 completas" && git push`
   → Vercel faz deploy automático em ~2 min → obter URL pública

## 📋 Proximas fases

### Fase 2 — Texto → Voz (TTS)
- [ ] Setar `elevenlabs_voice_id` no perfil do usuário de teste no Supabase
- [ ] Implementar `api/tts.ts`: buscar `voice_id` do perfil → ElevenLabs → audio
- [ ] Frontend: conectar botão "Falar" → `apiFetch('/api/tts')` → `playAudio(blob)`

### Fase 3 — Correcao + 3 modos
- [ ] Implementar `api/correcao.ts`: OpenAI gpt-4o-mini, prompt conservador
- [ ] UI: tela de "Conferir" (Modo 2) + seleção de modo
- [ ] Salvar `modo_preferido` em `perfis`

### Fase 4 — Medicao de uso
- [ ] Plugar `logUso()` em `tts.ts` e `correcao.ts` após cada chamada
- [ ] Preencher tabela de preços em `docs/MEDICAO-USO.md`

### Fase 5 — Audio → Texto (STT)
- [ ] Implementar `api/stt.ts` (AssemblyAI ou ElevenLabs Scribe)
- [ ] Frontend `Gravar.tsx`: botão microfone + `MediaRecorder` + envio do áudio

### Fase 6 — PWA polish
- [ ] `Frases.tsx`: grade de tiles por categoria (Saúde/Necessidades/Social/Emergência)
- [ ] Tela Acessibilidade (tamanho de fonte, alto contraste)
- [ ] Tela Config IA (modo_preferido)
- [ ] Smoke test install PWA no iOS/Android

## 💡 Backlog
- [ ] Tabela `conversas` (histórico) + política de retenção (privacidade)
- [ ] Modelo de contas: auto-cadastro + pagamento self-serve (decisão adiada)
- [ ] Automação do clone de voz (onboarding manual na POC)
- [ ] Domínio `app.onevox.com` → apontar para Vercel
