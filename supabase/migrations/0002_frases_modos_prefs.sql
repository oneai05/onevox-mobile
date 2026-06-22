-- OneVox - frases prontas + preferencias (modo de correcao, tamanho de fonte)
-- Aplicar via Supabase MCP apply_migration (ou supabase db push)

-- ============ perfis: redefinir modo_preferido + tamanho de fonte ============
-- modo_preferido passa a representar o ESTILO de correcao:
--   1 = conservador  (corrige apenas typos/gramatica, nunca muda o sentido)
--   2 = reconstrucao (decodifica texto truncado e reconstroi a frase pretendida)
comment on column public.perfis.modo_preferido is '1=conservador, 2=reconstrucao';

alter table public.perfis
  add column if not exists font_scale text not null default 'normal'
  check (font_scale in ('normal', 'grande', 'extra'));

-- ============ frases (frases rapidas por categoria, por usuario) ============
create table if not exists public.frases (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  texto     text not null,
  categoria text not null check (categoria in ('necessidades', 'saude', 'social', 'emergencia')),
  criado_em timestamptz not null default now()
);
create index if not exists frases_user_idx on public.frases (user_id, categoria);

-- ============ RLS: cada usuario gerencia apenas as proprias frases ============
alter table public.frases enable row level security;

create policy "frases_select_own" on public.frases for select using (auth.uid() = user_id);
create policy "frases_insert_own" on public.frases for insert with check (auth.uid() = user_id);
create policy "frases_update_own" on public.frases for update using (auth.uid() = user_id);
create policy "frases_delete_own" on public.frases for delete using (auth.uid() = user_id);
