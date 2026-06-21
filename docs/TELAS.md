# OneVox — Telas e Fluxo de Navegacao

> Inventario de telas e como o usuario navega. Base: mockups enviados. Cada tela
> lista seu proposito e os componentes principais. Regras visuais em `DESIGN.md`.

## 1. Mapa de navegacao

```
[Login]
   |  (autenticado)
   v
[Consentimento]  (so no 1o uso - opt-in da voz/uso)
   |
   v
+-------------------- App (tab bar inferior) --------------------+
|  [Teclado]      [Gravar]      [Frases]      [Perfil]           |
|   (home)         (audio)      (grade)        (conta)           |
+----------------------------------------------------------------+
                                                  |
                Perfil abre sub-telas:            v
                [Treinar/Atualizar Voz] [Config IA] [Acessibilidade]
                [Historico] [Suporte] [Sair]

Fluxo de fala (Modo 2):  texto -> [Conferir] -> falar
Fluxo de fala (Modo 1/3): texto -> falar (sem parar)
```

## 2. Telas

### Login
- Proposito: autenticar (Supabase Auth). Contas criadas pela equipe na POC.
- Componentes: wordmark, campo email, campo senha, botao primario "Entrar".

### Consentimento (1o uso)
- Proposito: opt-in de uso da voz clonada e dos dados (privacidade).
- Componentes: texto curto e claro, checkbox, botao "Concordar e continuar".
- Grava flag local; so aparece uma vez.

### Teclado (home / principal)
- Proposito: digitar e emitir fala. Tela mais usada.
- Componentes: cartao de texto grande; bloco "OneAI" (correcao); botoes de acao
  (Sim / Nao / Limpar / Desfazer); **botao grande "Falar"**.
- O comportamento depende do modo ativo (ver Config IA).

### Gravar (audio)
- Proposito: paciente fala -> STT transcreve -> entra no fluxo de fala.
- Componentes: botao de microfone grande, indicador de gravacao, texto transcrito
  pra revisao. (Fase posterior do PLAN.)

### Frases rapidas
- Proposito: emitir frases prontas com 1 toque (atalho, sem STT/correcao).
- Componentes: abas de categoria (Saude / Necessidades / Social / Emergencia);
  grade de tiles com icone + label (ex.: "Estou com dor", "Preciso de ajuda").
- Emergencia com acento `--danger`.

### Perfil
- Proposito: conta + acesso as configuracoes.
- Componentes: foto + nome; **cartao "Minha Voz Clonada"** com status (Voz Ativa /
  ultima atualizacao) e botao "Treinar/Atualizar Voz"; linhas de menu: Config IA,
  Acessibilidade, Historico de Conversas, Suporte, Sair.

### Config IA
- Proposito: escolher o modo de operacao.
- Componentes: selecao entre Modo 1 (Literal), Modo 2 (Correcao + conferir),
  Modo 3 (Correcao automatica). Salva em `perfis.modo_preferido`.

### Acessibilidade
- Proposito: ajustar leitura.
- Componentes: tamanho de fonte (16-24), alto contraste, (futuro) reduzir animacao.

### Treinar/Atualizar Voz
- Proposito: onboarding/atualizacao da voz. **Manual pela equipe na POC**; a tela
  pode so exibir status e instrucoes nesta fase.

### Historico de Conversas
- Proposito: ver falas anteriores. Avaliar privacidade/retencao antes de persistir.

### Suporte
- Proposito: contato/ajuda.

## 3. Observacoes de fluxo

- A **tela de Conferir** so existe no Modo 2 (mostra o texto corrigido pra editar
  antes de falar). Nos Modos 1 e 3 nao aparece.
- Todo acesso passa por Login; rotas privadas redirecionam pra Login se sem sessao.
- Consentimento bloqueia o app ate ser aceito (so 1a vez).
