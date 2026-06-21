# Context — OneVox Mobile
> Atualizado: 2026-06-20

## Estado atual

Fase de **design e documentacao** da POC. Ainda nao ha codigo de aplicacao.

- Diagrama de fluxo de dados **aprovado** pelo usuario (`docs/fluxo-dados.png`).
- Proposta de arquitetura, seguranca e medicao de uso **documentadas** em `docs/`.
- `.env.example` e `.gitignore` criados na raiz.
- Repositorio **ainda nao e git**.
- Proximo marco: plano de implementacao da POC.

## OneVox em uma frase

Plataforma **externa** de comunicacao assistiva (AAC) para pacientes com
dificuldade de fala. Input por audio (transcrito) ou texto -> correcao opcional ->
audio na voz clonada do proprio paciente. "OneVox" = produto; "OneAI" = a empresa.

## Ultima sessao — 2026-06-20

- Trabalhando em: design da arquitetura + diagrama + documentacao inicial.
- Feito:
  - Avaliacao da ideia (PWA, no estilo do app de um colega) e validacao do formato.
  - Diagrama de fluxo em `docs/fluxo-dados.html` -> renderizado para
    `docs/fluxo-dados.png` via Chrome headless. Varias iteracoes: correcao de
    sobreposicao de setas (roteamento aninhado), textos estourando os blocos,
    troca de "OneAI" por "OpenAI", acentuacao e aumento dos rotulos.
  - Docs: `ARQUITETURA.md`, `SEGURANCA.md`, `MEDICAO-USO.md`.
  - `.env.example` e `.gitignore`.
- Parou em: **tudo documentado pra desenvolver em outra maquina**. Ponto de entrada
  `README.md` -> ordem de leitura -> `docs/EXECUCAO.md` (runbook). Icone OneVox
  definido (onda A1) e conjunto completo gerado em `brand/icons/` (quadrado/maskable/
  circulo/favicon) + `brand/onevox-mark.png`; emblema One AI em `brand/oneai-*`/
  `brand/oneai-icons/`. Migration concreta em `supabase/migrations/0001_init.sql`.
  Proximo (na outra maquina): seguir `docs/EXECUCAO.md` — git, login CLIs, provisionar
  Supabase/Vercel, scaffold. Falta apenas a auth inicial dos CLIs + as chaves de API
  (do usuario) e escrever o codigo do app conforme `PLAN.md`.

## Em aberto (decisoes adiadas)
- Modelo de contas de longo prazo: auto-cadastro + pagamento self-serve (vs codigo
  de convite vs so manual). Revisitar apos a POC. A medicao de uso ja habilita a cobranca.
- Provedor de STT definitivo (AssemblyAI vs ElevenLabs Scribe) - decidir testando
  com audio real de paciente.

## Decisoes tecnicas

| Decisao | Justificativa | Data |
|---------|--------------|------|
| Formato PWA (sem loja) | Baixa friccao, instalavel pela web, distribuicao por link, atualizacao instantanea | 2026-06-20 |
| Projeto externo, sem infra/dado Hapvida | Usuario confirmou que e empresa propria; padrao Hapvida (AKS/Unity Catalog) nao se aplica | 2026-06-20 |
| Stack: PWA + Supabase + Vercel Functions | Espelha o stack do colega; free-tier viavel; Supabase Auth resolve login | 2026-06-20 |
| OpenAI para correcao de texto | ElevenLabs nao corrige texto, so transcreve/fala; correcao exige LLM. OpenAI e a ferramenta (OneAI e a marca da empresa) | 2026-06-20 |
| ElevenLabs com voice_id por usuario | Cada paciente tem voz clonada propria; voice_id vinculado ao login | 2026-06-20 |
| 3 modos (literal / correcao+conferir / auto) | Equilibrio entre latencia e seguranca da fala; modo 2 como padrao inicial | 2026-06-20 |
| Correcao conservadora | Paciente com dificuldade de comunicacao; LLM nao pode mudar o sentido | 2026-06-20 |
| Chaves so no backend; frontend publico | Frontend e sempre inspecionavel (web); protecao real = backend nao-baixavel | 2026-06-20 |
| voice_id derivado da sessao, nunca do payload | Impede um usuario usar a voz de outro | 2026-06-20 |
| Medicao de uso por usuario no backend | Base para cobranca futura e ativos/inativos; backend e a unica fonte confiavel de uso | 2026-06-20 |
| Render SVG->PNG via Chrome headless | Sem node/imagemagick na maquina; Python + Chrome disponiveis | 2026-06-20 |
| Provisionamento via CLI/API/MCP (Supabase + Vercel) | Minima friccao: Claude cria/configura/deploya sem o usuario mexer em dashboard. Exige auth inicial unica (token/login do CLI) | 2026-06-20 |
| Distribuicao: botao no site -> app em subdominio | Baixa friccao; URL publica nao e risco (login e o gate). Subdominio (app.onevox.com) separa institucional do app | 2026-06-20 |
| Contas: equipe cria manualmente na POC | Casa com onboarding manual da voz; auto-cadastro + pagamento self-serve fica pra depois (ja habilitado pela medicao de uso). Decisao adiada | 2026-06-20 |
| Paleta e logo oficiais do One AI | Recebido manual (PDF) + logo. Paleta: verde #4FCCAA, teal #2EBFC2, azul #71D2DC, navy #193565. Emblema EXTRAIDO do PDF (imagem+mascara via PyMuPDF), nao redesenhado. Icones PWA/favicon gerados com Pillow | 2026-06-20 |
| One AI = empresa (by Worth IT); OneVox = produto | Logo oficial = emblema One AI; nome do produto "OneVox" e tratamento de texto | 2026-06-20 |
| Icone do app OneVox = onda de audio (variante A1) | Escolhido apos avaliar variacoes; barras refinadas (limpas, legiveis ate 28px) com gradiente verde->teal->azul. Conjunto completo (quadrado/maskable/circulo/favicon) em brand/icons/. Emblema One AI continua como marca da empresa | 2026-06-20 |

## Arquitetura (resumo)

```
PWA (React+Vite, instalavel)
   | HTTPS (so a nossa API)
Vercel Functions (proxy seguro, guarda TODAS as chaves)
   |-- STT (AssemblyAI / ElevenLabs Scribe)   -> texto
   |-- OpenAI                                   -> correcao conservadora
   |-- ElevenLabs (voice_id do usuario)         -> audio (voz clonada)
Supabase: Auth + perfis (voice_id, modo) + uso (log/custo) + historico
```

Detalhes completos em `docs/ARQUITETURA.md`, `docs/SEGURANCA.md`,
`docs/MEDICAO-USO.md`.
