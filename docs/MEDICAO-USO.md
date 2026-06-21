# OneVox - Medicao de uso e custo por usuario

> Objetivo: registrar, por usuario e por dia, quanto se gastou em OpenAI e
> ElevenLabs, quem usou e quando. Isso habilita: base para **cobranca futura**,
> visao de **ativos vs inativos**, e controle de **custo**. A ideia desta fase e
> **criar a possibilidade** (instrumentacao + esquema), nao ainda cobrar.

## 1. Onde medir: sempre no backend

O backend (Vercel Functions) e o **unico lugar** que ve o uso real:

- A resposta da OpenAI traz `usage` (tokens de entrada/saida).
- A chamada da ElevenLabs e cobrada por **caractere** do texto enviado (sabemos o
  tamanho exato do texto).

Por isso, todo log de uso e gravado pelo backend, logo apos cada chamada externa.
O frontend nunca registra uso (nao e confiavel).

## 2. Modelo de dados (Supabase / Postgres)

### Tabela `perfis` (estende `auth.users`)

```sql
create table perfis (
  id                 uuid primary key references auth.users(id) on delete cascade,
  nome               text,
  elevenlabs_voice_id text,            -- voz clonada do usuario
  modo_preferido     smallint default 2, -- 1=literal, 2=correcao+conferir, 3=auto
  ativo              boolean default true,
  criado_em          timestamptz default now()
);
```

### Tabela `uso` (um evento por chamada externa)

```sql
create table uso (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  criado_em    timestamptz default now(),
  provedor     text not null,      -- 'openai' | 'elevenlabs' | 'stt'
  operacao     text not null,      -- 'correcao' | 'tts' | 'stt'
  modo         smallint,           -- modo de operacao usado (1/2/3), quando aplicavel
  tokens_in    integer,            -- OpenAI: tokens de entrada
  tokens_out   integer,            -- OpenAI: tokens de saida
  caracteres   integer,            -- ElevenLabs: caracteres sintetizados
  segundos_audio numeric,          -- STT: duracao do audio transcrito (se aplicavel)
  custo_usd    numeric(10,6),      -- custo estimado deste evento
  latencia_ms  integer,
  sucesso      boolean default true,
  detalhe      jsonb               -- modelo usado, voice_id, erro, etc.
);

create index on uso (user_id, criado_em);
```

> **Historico de conversas:** se for guardar o texto falado, fazer numa tabela
> separada (`conversas`) e guardar **o minimo necessario** (privacidade). Avaliar
> retencao/expurgo. O conteudo aqui e fala do dia a dia, mas ainda e dado pessoal.

### RLS (Row Level Security)

- Ligar RLS em `perfis`, `uso` e `conversas`.
- Politica: cada usuario le **apenas** as proprias linhas.
- A escrita em `uso` e feita pelo backend com a `service_role` (ignora RLS).
- Relatorios administrativos: usar a `service_role` no backend, nunca expor no app.

## 3. Como calcular o custo

O backend calcula o custo de cada evento a partir dos numeros retornados e de uma
**tabela de precos de referencia** (manter atualizada com os valores vigentes de
cada fornecedor - precos mudam, sempre conferir no painel deles).

```
custo_openai     = tokens_in  * preco_in_por_token
                 + tokens_out * preco_out_por_token
custo_elevenlabs = caracteres * preco_por_caractere
```

Tabela de precos (preencher/validar com os valores atuais):

| Provedor | Unidade | Preco (USD) | Observacao |
|---|---|---|---|
| OpenAI (modelo X) | 1M tokens entrada | (preencher) | depende do modelo escolhido |
| OpenAI (modelo X) | 1M tokens saida | (preencher) | |
| ElevenLabs | 1 caractere | (preencher) | varia com o plano/assinatura |
| STT (AssemblyAI/Scribe) | minuto de audio | (preencher) | so se usar STT pago |

> O `custo_usd` gravado e uma **estimativa nossa**. Reconciliar periodicamente com
> os dashboards de billing da OpenAI e da ElevenLabs para validar.

## 4. Relatorios que isso habilita

```sql
-- Gasto por usuario por dia
select user_id, date(criado_em) as dia,
       sum(custo_usd) as custo_dia,
       count(*) as chamadas
from uso
group by user_id, date(criado_em)
order by dia desc, custo_dia desc;

-- Usuarios ativos nos ultimos 7 dias
select count(distinct user_id) as ativos_7d
from uso
where criado_em >= now() - interval '7 days';

-- Quem nao usa ha mais de 30 dias (para reengajamento)
select p.id, p.nome, max(u.criado_em) as ultimo_uso
from perfis p
left join uso u on u.user_id = p.id
group by p.id, p.nome
having max(u.criado_em) is null or max(u.criado_em) < now() - interval '30 days';
```

## 5. Cobranca futura (o que fica habilitado)

Com `uso` granular por usuario, depois da para:

- Definir um modelo de cobranca (por uso, por franquia mensal de caracteres/tokens,
  por assinatura) sem mudar a instrumentacao.
- Gerar fatura/extrato por usuario a partir do somatorio de `custo_usd` no periodo.
- Aplicar limites/alertas por usuario (ex.: teto diario de custo).

Nada disso precisa estar pronto agora - o ponto desta fase e **deixar o log
correto desde o inicio**, para nao perder dados historicos.
