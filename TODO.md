# TODO — OneVox Mobile
> Atualizado: 2026-06-22

## ✅ Concluído
- [x] Scaffold monorepo (web/ + api/) — Fases 0 + 1
- [x] Supabase provisionado (onevox, sa-east-1, migration + RLS)
- [x] Auth: login, PrivateRoute, logout
- [x] Login redesenhado: ícone + wordmark + "Powered by One AI"
- [x] AppShell: tab bar (Teclado / Gravar / Frases / Perfil)
- [x] Vercel linkada ao GitHub, env vars configuradas
- [x] api/tts.ts — ElevenLabs multilingual v2 (voice_id do perfil)
- [x] api/correcao.ts — OpenAI gpt-4o-mini, prompt conservador
- [x] Teclado.tsx — botões "Falar" e "Corrigir e Falar" funcionais
- [x] Voz "Cassiano" configurada no perfil de teste no Supabase
- [x] **POC deployada e pública: https://onevox-mobile.vercel.app**
- [x] **TTS + correção validados ponta-a-ponta em produção**
- [x] **logUso() confirmado gravando na tabela `uso`**

## 🔥 Agora

1. **Instalar e testar no celular** (você):
   - Abrir https://onevox-mobile.vercel.app no Chrome (Android) ou Safari (iOS)
   - Login: `teste@onevox.com` / `onevox123`
   - Menu → "Adicionar à tela inicial" → abrir pelo ícone
   - Testar Falar / Corrigir e Falar

2. **Preencher tabela de preços** em `docs/MEDICAO-USO.md` (custo OpenAI + ElevenLabs por uso).

### Fase 5 — STT (Áudio → Texto)
- [ ] Implementar `api/stt.ts` (AssemblyAI ou ElevenLabs Scribe)
- [ ] `Gravar.tsx`: botão microfone + MediaRecorder + envio do áudio

### Fase 6 — PWA polish
- [ ] `Frases.tsx`: grade de tiles por categoria
- [ ] Tela Acessibilidade (tamanho de fonte, alto contraste)
- [ ] Tela Config IA (modo_preferido salvo no perfil)
- [ ] Smoke test PWA install no iOS/Android

## 💡 Backlog
- [ ] Domínio `app.onevox.com` → apontar para Vercel
- [ ] Automação do clone de voz (onboarding manual na POC)
- [ ] Modelo de contas: auto-cadastro + pagamento self-serve
- [ ] Tabela `conversas` (histórico) + política de retenção
