# OneVox — Design System

> Identidade visual e regras de UI. Base: os mockups enviados (tema escuro,
> gradiente verde-ciano, cantos arredondados, tab bar inferior). **Prioridade
> de acessibilidade**: o publico tem dificuldade motora (ex.: Parkinson),
> entao alvos grandes, alto contraste e poucos passos sao requisito, nao enfeite.

## 1. Marca

- **Wordmark "OneVox":** "One" em branco, "Vox" no gradiente. No app e **texto
  vivo** (CSS), nao imagem - foi assim que apareceu natural nos mockups.
- Subtitulo "Mobile" em cinza, menor, abaixo do wordmark (header).
- **Icone do app = OneVox (onda de audio, variante A1):** assets em `brand/icons/`
  (quadrado, maskable, circulo, favicon) e `brand/onevox-mark.png` (onda transparente
  pra UI, ex.: botao de voz).
- **Emblema One AI** (coracao + sinapses): logo oficial da **empresa**, usado em
  contexto institucional e como marca de IA in-app (`brand/oneai-emblem*.png`).
  NAO redesenhar.

CSS do wordmark:

```css
.brand { font-weight: 800; letter-spacing: -0.01em; }
.brand .vox {
  background: linear-gradient(90deg, var(--grad-from), var(--grad-to));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.brand small { display:block; color: var(--text-muted); font-weight:500; }
```

## 2. Cores (tokens)

Base: paleta **oficial** do manual One AI (`brand/source/Identidade Visual - One AI.pdf`).

```css
:root {
  /* Marca (oficial One AI) */
  --brand-green: #4FCCAA;  /* verde: vida, novo comeco */
  --brand-teal:  #2EBFC2;  /* teal: acento */
  --brand-blue:  #71D2DC;  /* azul claro: apoio */
  --brand-navy:  #193565;  /* navy: ciencia, confianca */
  /* Gradiente da marca */
  --grad-from:   #4FCCAA;
  --grad-to:     #2EBFC2;
  /* Tema escuro do app (navy mais profundo que o navy da marca) */
  --bg:          #0A1730;  /* fundo geral */
  --surface:     #142544;  /* cards e botoes secundarios */
  --surface-2:   #0F1E3A;  /* paineis/containers */
  --border:      #284067;  /* bordas sutis */
  --text:        #FFFFFF;
  --text-muted:  #9DB0CE;
  --success:     #4FCCAA;
  --danger:      #FF5A6E;  /* emergencia / acao critica */
}
```

- Gradiente da marca: `linear-gradient(90deg, var(--grad-from), var(--grad-to))`.
- Categoria "Emergencia" (frases) usa `--danger` como acento.
- **Modo alto contraste** (Acessibilidade): aumentar contraste de `--text-muted`
  e bordas; opcao na tela de Acessibilidade.

## 3. Tipografia

- Fonte: geometrica e legivel. Proposta: **Poppins** (ou Plus Jakarta Sans /
  Manrope) com fallback `system-ui, sans-serif`. Confirmar contra a marca final.
- Escala base **18px** (maior que o padrao 16, por acessibilidade), ajustavel de
  16 a 24px na tela de Acessibilidade.
- Pesos: 700/800 titulos, 600 botoes, 400/500 corpo.
- Inputs sempre >= 16px (evita zoom automatico no iOS).

## 4. Espacamento e raio

- Escala de espaco: 8 / 12 / 16 / 20 / 24 / 32 px.
- Raio: botoes 14px, cards/linhas 16-18px, tiles (frases) 20px, pills 999px.
- Respiro generoso entre elementos tocaveis (evita toque errado por tremor).

## 5. Botoes e alvos de toque

**Acessibilidade manda:** alvo minimo **56px** (acima do padrao 44px).

| Tipo | Uso | Altura | Estilo |
|---|---|---|---|
| Primario (CTA) | "Falar", "Treinar voz" | 60px | gradiente de fundo, texto escuro, raio 14, largura total |
| Secundario (linha) | menu do Perfil | 64px | `--surface`, borda, icone (gradiente) + label + chevron |
| Tile (grade) | Frases rapidas | >= 96px | `--surface`, icone linha centralizado + label |
| Acao rapida | Sim/Nao/Limpar/Desfazer | ~80px quadrado | `--surface`, icone + label, raio 16 |
| Tab bar item | navegacao | barra 64px | icone 26px + label 12px; ativo em gradiente + brilho |

- Estado ativo/foco visivel sempre (borda/brilho no gradiente) - importante pra
  quem navega devagar.
- Botao primario de "Falar" deve ser o maior e mais obvio da tela principal.

## 6. Componentes-chave

- **Topbar:** wordmark central "OneVox" + "Mobile" (como nos mockups). `sticky`.
- **Tab bar inferior:** 4 abas — Teclado, Gravar, Frases, Perfil. Item ativo no
  gradiente com leve brilho.
- **Cartao de texto** (tela Teclado): area grande, texto >= 20px, placeholder
  "Sua mensagem aparecera aqui...".
- **Icones:** estilo linha, traco 2-2.4px, no gradiente da marca. Sugestao:
  biblioteca `lucide` recolorida, ou icones SVG custom (como os do diagrama).

## 7. Acessibilidade (requisitos)

- Alvos >= 56px; espacamento generoso.
- Texto base 18px, ajustavel; opcao de alto contraste.
- `prefers-reduced-motion` respeitado (animacoes suaves/curtas).
- Labels claros + `aria-label` em todos os botoes de icone (leitor de tela).
- Botao "Falar" grande e fixo; minimo de passos pra emitir uma fala.
- Nada essencial dependendo so de cor (icone + texto sempre juntos).

## 8. PWA

- `manifest`: nome "OneVox", `display: standalone`, `orientation: portrait`,
  `theme_color: #0A1730`, `background_color: #0A1730`.
- Icones do app = onda OneVox em `brand/icons/` (72..512 + maskable + circulo + favicon).
- `viewport` com `maximum-scale=1, user-scalable=no` (evita zoom no input iOS).
