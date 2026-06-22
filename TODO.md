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
1. **Criar as vozes no ElevenLabs** (você) e me mandar **nome + voice_id** de cada testador.
   Eu preencho `scripts/testadores.json` e rodo `node --env-file=.env scripts/criar-testadores.mjs`
   → gera login+senha de cada um (com a voz própria amarrada).
2. **Testar no celular** (você): reabrir o app (cache do PWA) e testar **Gravar** + 2 modos + Frases.
3. **Acompanhar uso:** `select * from public.uso_resumo;` no painel do Supabase (ou me pedir o relatório).

## 📋 Em breve
- [ ] Aviso de "nova versão disponível" no PWA (nível B do fluxo de atualização)
- [ ] Tela Config IA dedicada (hoje o modo está inline no Perfil)
- [ ] Onboarding da voz clonada (hoje manual no Supabase)

## 💡 Backlog
- [ ] Domínio `app.onevox.com` → apontar para Vercel
- [ ] Modelo de contas: auto-cadastro + pagamento self-serve
- [ ] Tabela `conversas` (histórico de transcrições) + política de retenção
- [ ] Refatorar para hook único de áudio (parcial: `useFala` já compartilhado)
