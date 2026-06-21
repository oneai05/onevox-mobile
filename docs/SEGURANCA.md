# OneVox - Seguranca e protecao das chaves

> O objetivo aqui e duplo: (1) as chaves de API (OpenAI, ElevenLabs) nunca ficarem
> expostas, e (2) o usuario nao conseguir explorar nossos fluxos/segredos. Este
> documento separa o que e **garantia tecnica** do que e **mitigacao** (e por que).

## 1. As chaves de API: protegidas de verdade

As chaves vivem **apenas** no backend (Vercel Functions), como variaveis de
ambiente. O fluxo e sempre:

```
Celular (PWA)  --->  Nossa API (Vercel Function)  --->  OpenAI / ElevenLabs
   sem chave           usa a chave (env var)              recebe a chave
```

Regras:

- **Nunca** colocar chave no frontend (qualquer `VITE_*` vira publico no build).
- **Nunca** comitar chave. As chaves entram pelo painel da Vercel (Environment
  Variables) e/ou Supabase Secrets - fora de qualquer arquivo versionado.
- **Nunca** colar chave em chat, ticket, print ou codigo.
- O arquivo [`.env.example`](../.env.example) documenta **quais** variaveis existem,
  sempre com valores vazios. O `.env` real e gitignored e fica so na maquina/ambiente.

### Chaves do Supabase: atencao a diferenca

| Chave | Onde usa | Sensibilidade |
|---|---|---|
| `SUPABASE_ANON_KEY` | Frontend | Publica por design. Protegida pela RLS (Row Level Security). |
| `SUPABASE_SERVICE_ROLE_KEY` | **So backend** | Secreta. Ignora RLS - se vazar, expoe tudo. |

## 2. O frontend e publico - e tudo bem

Verdade tecnica que precisa estar clara para todos: o **frontend (PWA) e baixado
para o navegador para rodar**. Qualquer pessoa com o DevTools consegue ler o
codigo do frontend (mesmo minificado). **Nao existe** forma de impedir isso 100% -
e a natureza da web.

O que **nao** funciona (nao vamos perder tempo com isso como se fosse seguranca):

- "Ofuscar" o JS achando que vira segredo. Sobe a barra, nao protege.
- Esconder logica de negocio sensivel no cliente. Ela sera lida.

O que **funciona** (nossa estrategia real):

1. **Mover tudo que importa para o backend.** Prompts de correcao, parametros de
   chamada da ElevenLabs, regras de custo, as chaves - tudo no backend, que **nunca**
   e baixavel. Esse e o segredo de verdade, e fica protegido.
2. **Frontend minificado e sem source maps em producao** (Vite ja minifica;
   desligar `build.sourcemap` no build de prod). Mitigacao, nao garantia.
3. **Frontend so sabe chamar a nossa propria API.** Ele nao conhece OpenAI nem
   ElevenLabs diretamente.

Resumo: tratamos o frontend como **publico**; o que nao pode vazar mora no backend.

## 3. Gate de autenticacao (a API nao e aberta)

Mesmo sem chave exposta, a nossa API nao pode ser de uso livre. Por isso:

- **Toda** rota (exceto login e health check) exige uma **sessao valida do Supabase**
  (JWT no header). Sem sessao, a chamada e rejeitada.
- O backend valida o token a cada chamada e identifica o `user_id` a partir dele.
- **Rate limit por usuario** (ex.: N chamadas/minuto) para evitar abuso e estouro
  de custo.
- **CORS restrito** ao dominio do nosso PWA.

## 4. voice_id derivado da sessao

O `voice_id` da ElevenLabs **nunca** vem do corpo da requisicao do cliente. O
backend descobre o `voice_id` consultando o perfil do **usuario logado** (pelo
`user_id` da sessao). Consequencias:

- Um usuario so consegue gerar audio com a **propria** voz.
- Impossivel pedir "fale com a voz do usuario X" manipulando a requisicao.

## 5. Checklist de seguranca

- [ ] `.env` no `.gitignore`; nenhuma chave comitada.
- [ ] Chaves cadastradas so na Vercel (env) / Supabase (secrets).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` e chaves de OpenAI/ElevenLabs **apenas** no backend.
- [ ] Frontend sem nenhum segredo; nenhuma chamada direta a OpenAI/ElevenLabs.
- [ ] `build.sourcemap = false` em producao.
- [ ] Toda rota protegida exige sessao valida do Supabase.
- [ ] Rate limit por usuario ativo.
- [ ] CORS restrito ao dominio do PWA.
- [ ] RLS ligada nas tabelas do Supabase (usuario so le os proprios dados).
- [ ] `voice_id` sempre derivado da sessao, nunca do payload do cliente.
