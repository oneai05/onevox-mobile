-- View de resumo de uso por usuário (relatório sob demanda).
-- Lida via painel do Supabase / service_role — NÃO exposta ao cliente (anon/authenticated),
-- pois agrega dados de todos os usuários (bypassaria a RLS por usuário da tabela `uso`).

create or replace view public.uso_resumo as
select
  u.user_id,
  p.nome,
  count(*)                                              as chamadas,
  count(*) filter (where u.operacao = 'correcao')       as correcoes,
  count(*) filter (where u.operacao = 'tts')            as falas,
  count(*) filter (where u.operacao = 'stt')            as transcricoes,
  count(*) filter (where u.sucesso = false)             as falhas,
  coalesce(sum(u.tokens_in), 0)                         as tokens_in,
  coalesce(sum(u.tokens_out), 0)                        as tokens_out,
  coalesce(sum(u.caracteres), 0)                        as caracteres_tts,
  round(coalesce(sum(u.segundos_audio), 0)::numeric, 1) as segundos_stt,
  round(coalesce(sum(u.custo_usd), 0)::numeric, 4)      as custo_usd_total,
  max(u.criado_em)                                      as ultimo_uso
from public.uso u
left join public.perfis p on p.id = u.user_id
group by u.user_id, p.nome
order by custo_usd_total desc;

-- garante que o cliente não consiga ler o resumo agregado
revoke all on public.uso_resumo from anon, authenticated;
