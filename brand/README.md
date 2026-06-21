# brand/ — Identidade visual

Fonte de verdade dos ativos. No scaffold do frontend, `icons/` e os PNGs vao para
`web/public/` (ver `docs/EXECUCAO.md`).

## Duas marcas

- **One AI** (by Worth IT) = empresa/marca-mae. Logo oficial = **emblema** (coracao
  + sinapses). Manual completo em `source/Identidade Visual - One AI.pdf`.
- **OneVox** = produto (o app). Icone proprio = **onda de audio** (variante A1,
  escolhida), na paleta One AI. Comunica "voz/audio".

Regra: o **icone do app e o OneVox (onda)**; o **emblema One AI** e a marca da
empresa, usado em contextos institucionais e como marca de IA dentro do app.
Nenhum logo foi redesenhado: o emblema foi extraido do PDF oficial.

## Paleta oficial

| Cor | Hex |
|---|---|
| Verde | `#4FCCAA` |
| Teal | `#2EBFC2` |
| Azul claro | `#71D2DC` |
| Navy | `#193565` |

Gradiente da marca: `#4FCCAA -> #2EBFC2` (e a onda do icone flui ate `#71D2DC`).

## Arquivos

### Icone do app OneVox — `icons/` (onda de audio A1)
- `icon-72..512.png` — icones PWA padrao (quadrado, fundo navy + glow teal).
- `maskable-192/512.png` — com respiro extra (safe-zone Android).
- `icon-circle-192/512.png` — versao **redonda** (lugares que pedem decalque em circulo).
- `icon-rounded-512.png` — quadrado com cantos arredondados.
- `apple-touch-icon.png` (180) — iOS arredonda sozinho.
- `favicon-16/32/48.png` + `favicon.ico`.
- `../onevox-mark.png` — so a onda (transparente), pra usar dentro do app (ex.: botao de voz).

### Marca da empresa One AI
- `oneai-emblem.png` — emblema sozinho, transparente.
- `oneai-emblem-square.png` — emblema em canvas quadrado 1024, transparente.
- `oneai-logo-vertical.png` — emblema + "One AI", transparente.
- `oneai-icons/` — conjunto de icones gerado a partir do emblema (caso a empresa
  precise de icone proprio; NAO e o icone do app).

### Nome do produto
- `onevox-wordmark.svg` — tratamento tipografico de "OneVox" (texto; no app o header
  usa CSS — ver `docs/DESIGN.md`).

### Apoio
- `proposals/` — exploracoes de icone (PNG + HTML das opcoes que avaliamos).
- `source/` — originais: manual `.pdf` + `logo-oneai.jpeg` (nao usar direto).

## Regras de uso
- Emblema One AI: area de protecao, reducao maxima e versoes mono estao no PDF.
- Nao distorcer, nao recolorir, nao trocar o gradiente.
- Preferir fundo escuro (navy). Em fundo claro, usar a versao com texto navy do manual.

## Regerar os icones
Gerados com Python (PyMuPDF p/ extrair o emblema do PDF; SVG renderizado via Chrome
headless; Pillow p/ compor tamanhos). Passos no historico do projeto.
