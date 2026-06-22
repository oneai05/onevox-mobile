# TODO — OneVox Mobile
> Atualizado: 2026-06-22

## ✅ Concluído
- [x] Scaffold monorepo + Supabase (migration + RLS) + Auth (login/logout/guard)
- [x] AppShell, Teclado, api/tts (ElevenLabs), api/correcao (OpenAI)
- [x] **POC deployada e pública: https://onevox-mobile.vercel.app** (script `scripts/deploy.sh`)
- [x] TTS + correção validados ponta-a-ponta em produção; logUso gravando em `uso`
- [x] **2 modos de correção** (conservador / reconstrução) escolhidos no Perfil
- [x] **Frases prontas** (16 em 4 categorias, tabela `frases` no Supabase)
- [x] **Botão flutuante** de compartilhar áudio (Web Share API)
- [x] **Botões Sim/Não** no Teclado
- [x] **Acessibilidade**: tamanho de fonte (`perfis.font_scale`)
- [x] **Fase 5 — Gravar (STT)**: MediaRecorder → Whisper → texto editável → Falar/Corrigir

## 🔥 Agora
1. **Testar no celular** (você): reabrir o app (cache do PWA) e testar **Gravar** —
   tocar mic, falar, ver transcrição, Falar na voz clonada. Testar 2 modos e Frases.
2. **Medição de uso (Fase 4)**: preencher tabela de preços em `docs/MEDICAO-USO.md`
   (custo OpenAI correção + Whisper + ElevenLabs por uso) e conferir linhas em `uso`.

## 📋 Em breve
- [ ] Aviso de "nova versão disponível" no PWA (nível B do fluxo de atualização)
- [ ] Tela Config IA dedicada (hoje o modo está inline no Perfil)
- [ ] Onboarding da voz clonada (hoje manual no Supabase)

## 💡 Backlog
- [ ] Domínio `app.onevox.com` → apontar para Vercel
- [ ] Modelo de contas: auto-cadastro + pagamento self-serve
- [ ] Tabela `conversas` (histórico de transcrições) + política de retenção
- [ ] Refatorar para hook único de áudio (parcial: `useFala` já compartilhado)
