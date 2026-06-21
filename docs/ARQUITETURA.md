# OneVox - Arquitetura (Proposta)

> Documento vivo. Descreve o que o OneVox e, como os dados fluem e quais
> decisoes de arquitetura ja estao fechadas para a POC.

## 1. O que e o OneVox

OneVox e uma plataforma **externa** de comunicacao assistiva (AAC) para pacientes
com dificuldade de fala (ex.: Parkinson, voz comprometida, perda de fala). O
paciente faz um input por **audio** (que e transcrito) ou por **texto**, o sistema
opcionalmente **corrige** o texto, e devolve um **audio na voz clonada do proprio
paciente** para tocar no celular.

- Projeto/empresa proprios. **Nao** usa infraestrutura nem dados da Hapvida.
- "OneVox" e o produto. "OneAI" e a marca da empresa.
- Distribuicao como **PWA** (instalavel pela web, sem loja de apps), foco em
  baixa friccao e poucas permissoes.

## 2. Diagrama de fluxo

Ver [fluxo-dados.png](./fluxo-dados.png) (fonte editavel em
[fluxo-dados.html](./fluxo-dados.html), renderiza para PNG via Chrome headless).

## 3. Componentes

| Camada | Tecnologia | Papel |
|---|---|---|
| Frontend | PWA (React + Vite), instalavel | Interface no celular. **Publico por principio** - nenhum segredo aqui. |
| Backend | Vercel Functions (serverless) | Proxy seguro. Guarda **todas** as chaves de API. Cliente fala so com ele. |
| Auth + Dados | Supabase (Auth + Postgres) | Login, perfil, `voice_id` por usuario, log de uso, historico. |
| Transcricao (STT) | AssemblyAI ou ElevenLabs Scribe | Converte audio do paciente em texto. |
| Correcao de texto | **API da OpenAI** | Corrige o texto de forma conservadora (sem mudar o sentido). |
| Voz (TTS) | ElevenLabs | Gera audio na voz clonada do paciente (`voice_id` por usuario). |

## 4. Fluxo de dados (passo a passo)

1. Paciente faz login (Supabase Auth) -> recebe uma sessao (JWT).
2. Input:
   - **Audio:** o app envia o audio para a nossa API -> backend chama o STT -> texto.
   - **Texto:** vai direto como texto.
   - **Frases rapidas:** texto ja pronto, pula STT e correcao (atalho).
3. Conforme o **modo** escolhido pelo paciente, o texto pode passar pela correcao
   (OpenAI) e/ou por uma conferencia humana.
4. Backend chama a ElevenLabs com o `voice_id` do **usuario logado** (derivado da
   sessao) -> recebe o audio.
5. Backend registra o **uso** (custo OpenAI + ElevenLabs) e devolve o audio.
6. O app toca o audio no celular.

Em **nenhum** momento o celular recebe uma chave de API. Ele so conversa com a
nossa propria API.

## 5. Os 3 modos de operacao (config por paciente)

| Modo | O que faz | Latencia |
|---|---|---|
| 1 - Literal | Fala exatamente o texto, sem correcao. | Menor |
| 2 - Correcao + conferir | OpenAI corrige; o paciente confere/ajusta antes de falar. | Maior (esperado) |
| 3 - Correcao automatica | OpenAI corrige e ja fala, sem conferir. | Media |

A **correcao e sempre conservadora**: conserta erros obvios de digitacao/ditado,
sem mudar o sentido nem adicionar conteudo. O Modo 2 (conferir antes) e a rede de
seguranca disso e deve ser o padrao inicial.

## 6. Principios de arquitetura (nao negociaveis)

1. **Chaves de API so no backend.** Nunca no frontend, nunca no git. Ver
   [SEGURANCA.md](./SEGURANCA.md).
2. **Frontend e publico.** Nada sensivel no cliente; o que importa mora no backend.
3. **Toda chamada exige sessao valida.** A API nao e aberta; so usuario logado usa.
4. **`voice_id` vem da sessao**, nunca do que o cliente manda (um usuario nunca
   acessa a voz de outro).
5. **Todo uso e medido no backend** (OpenAI + ElevenLabs), por usuario. Ver
   [MEDICAO-USO.md](./MEDICAO-USO.md).

## 7. Provisionamento e automacao (MCP/API)

Objetivo: **minima friccao** na criacao e operacao do ambiente. O Claude orquestra
Supabase e Vercel via **CLI / API de gestao / MCP**, sem o usuario configurar nada
manualmente em dashboard:

- **Supabase:** criar projeto, aplicar migrations (tabelas + RLS), seed, gerar tipos.
- **Vercel:** criar projeto, configurar env vars (secrets), deploy, dominios.

Porem: e preciso uma **autenticacao inicial unica** (login do CLI ou access token
fornecido pelo usuario, guardado como env var, nunca no codigo/git). Depois disso o
fluxo e automatizado. Tudo como **provisionamento-as-code** (migrations versionadas,
config declarativa) para ser reproduzivel.

## 8. Documentos relacionados

- [SEGURANCA.md](./SEGURANCA.md) - protecao de chaves, realidade do frontend, gate de auth.
- [MEDICAO-USO.md](./MEDICAO-USO.md) - voice_id por usuario, log de uso e custo, base para cobranca.
