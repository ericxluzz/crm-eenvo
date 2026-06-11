-- =============================================================================
-- CRM eenvo — Migration 0003: etapas do funil dinâmicas (tabela stages)
-- Remove a trava CHECK de leads.stage e cria a tabela stages (editável pela UI).
-- "perdido" fica fixo (não excluível) e marcado como terminal.
-- =============================================================================

-- Solta a trava: agora o estágio do lead pode ser qualquer id de stages.
alter table public.leads drop constraint if exists leads_stage_check;

create table if not exists public.stages (
  id         text primary key,
  name       text not null,
  color      text not null default '#8A8F99',
  ordem      int  not null default 0,
  fixo       boolean not null default false,   -- não pode excluir (ex.: Perdido)
  terminal   text,                             -- 'perdido' | null
  created_at timestamptz not null default now()
);

alter table public.stages enable row level security;

create policy "stages_select_auth" on public.stages
  for select using (auth.role() = 'authenticated');
create policy "stages_write_auth" on public.stages
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Seed dos 6 estágios atuais (mantém ids/cores; não recria se já existir).
insert into public.stages (id, name, color, ordem, fixo, terminal) values
  ('mapeado',     'Mapeado',          '#8A8F99', 1, false, null),
  ('contatado',   'Contatado',        '#2563EB', 2, false, null),
  ('reuniao',     'Reunião marcada',  '#8E3FC4', 3, false, null),
  ('apresentado', 'Apresentado',      '#0891B2', 4, false, null),
  ('proposta',    'Proposta enviada', '#D97706', 5, false, null),
  ('perdido',     'Perdido',          '#DC2626', 6, true,  'perdido')
on conflict (id) do nothing;
