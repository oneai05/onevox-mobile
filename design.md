# OneVox Mobile — Design Document

## Visão Geral

OneVox Mobile é um aplicativo de comunicação assistiva (CAA) focado em pessoas com limitações de fala/motoras (ex: ELA). O app converte texto e fala em áudio com **voz clonada** do próprio usuário, usando IA para interpretar e reescrever mensagens com erros. Orientação: **portrait (9:16)**, uso de uma mão / rastreamento ocular.

## Identidade Visual (OneAI / OneVox)

A marca usa um visual tecnológico, escuro e sofisticado, com gradiente vibrante.

| Token | Valor | Uso |
| :--- | :--- | :--- |
| `background` | `#0A1628` (azul marinho quase preto) | Fundo das telas |
| `surface` | `#101F38` | Cards, áreas de input |
| `surfaceElevated` | `#16263F` | Cards destacados |
| `foreground` | `#FFFFFF` | Texto principal |
| `muted` | `#8A9BB5` | Texto secundário |
| `border` | `#243burst` → `#22354F` | Bordas/divisores |
| `primary` (gradiente início) | `#5DE89B` (verde) | Gradiente principal |
| `primary` (gradiente fim) | `#3AAEE6` (ciano/azul) | Gradiente principal |
| `success` | `#34D399` | Estados positivos (Sim) |
| `error` | `#F87171` | Estados negativos (Não) |

O elemento de marca recorrente é o **gradiente diagonal verde→ciano**, usado em botões primários, bordas ativas, ícones de destaque e no título "OneVox" (Vox em gradiente).

Tipografia: system font (San Francisco no iOS), pesos bold para títulos, tamanhos generosos para acessibilidade.

## Lista de Telas (4 abas)

1. **Teclado (Home)** — Comunicação por texto. Área de texto grande no topo, botão central "One AI" para gerar voz, ações rápidas (Sim, Não, Limpar, Desfazer).
2. **Gravar** — Pipeline de IA. Estados: Inicial (microfone), Gravando (waveform + tempo), Processando, Resultado (fala original + mensagem clara + reproduzir).
3. **Frases** — Biblioteca de frases rápidas por categoria (Saúde, Necessidades, Social, Emergência), em grid de cards com ícone.
4. **Perfil** — Foto/nome do usuário, card "Minha Voz Clonada" (status + treinar), opções (Configurações de IA, Acessibilidade, Histórico, Suporte).

## Conteúdo Principal por Tela

A aba **Teclado** mostra um campo de texto editável grande, com botão de fala (One AI) e ações. A aba **Gravar** mostra waveform durante captura e dois blocos de texto (original transcrito e mensagem reescrita pela IA) no resultado. A aba **Frases** mostra abas de categoria e um grid 3-col / 2-col de frases pré-definidas que falam ao toque. A aba **Perfil** centraliza configuração da voz clonada e acessibilidade.

## Fluxos de Usuário Principais

**Fluxo 1 — Falar texto digitado (Teclado):** usuário digita → toca "One AI" → áudio é gerado via ElevenLabs com voz clonada → reproduz.

**Fluxo 2 — Falar a partir de gravação (Gravar):** usuário toca microfone → fala → para → áudio é transcrito (Whisper) → IA reescreve/corrige → exibe "fala original" e "mensagem clara" → usuário toca reproduzir → ElevenLabs gera áudio com voz clonada.

**Fluxo 3 — Frase rápida:** usuário abre Frases → escolhe categoria → toca card → áudio gerado/reproduzido imediatamente.

**Fluxo 4 — Gerenciar voz (Perfil):** usuário vê status da voz clonada e ajusta acessibilidade (tamanho de fonte, contraste).

## Navegação Inferior (Tab Bar)

Quatro abas fixas, na ordem: **Teclado · Gravar · Frases · Perfil**. Aba ativa destacada com gradiente verde→ciano. Ícones: teclado, microfone, balão de fala, pessoa.

## Acessibilidade

Botões com área mínima de toque generosa (≥ 56px), alto contraste, fontes grandes, feedback tátil (haptics) em ações principais, e reprodução automática de áudio quando aplicável.

## Arquitetura Técnica

- **Frontend:** React Native (Expo), NativeWind, expo-audio (playback), expo-audio recording.
- **Voz Clonada (TTS):** API ElevenLabs via Edge/servidor (tRPC). Chave em `ELEVENLABS_API_KEY`. Voice IDs por usuário armazenados (inicialmente Roberto Dias: `GMafEIaeEWpGsrYrVqCX`).
- **Transcrição (STT):** helper nativo `transcribeAudio` (Whisper).
- **Interpretação/Reescrita:** helper nativo `invokeLLM` (Gemini/LLM).
- **Storage:** `storagePut` para subir áudios gravados antes da transcrição.
- **Persistência local:** AsyncStorage para frases, histórico e configurações (sem exigir login no MVP).
