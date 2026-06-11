-- =============================================================================
-- CRM eenvo — Migration 0002: modelo real alinhado ao app (leads + ambientes)
-- App interno. RLS habilitado em todas as tabelas. Um único usuário por ora,
-- mas as policies já ficam prontas para equipe (owner_id = auth.uid()).
--
-- Mantém de 0001: profiles, integracoes_google, set_updated_at(), handle_new_user().
-- Descarta as tabelas antigas (clientes/negocios/contatos/atividades) — sem uso.
-- Rodar no SQL Editor do Supabase. Idempotente onde possível.
-- =============================================================================

create extension if not exists "pgcrypto";

-- --- Limpeza do modelo antigo (sem uso no frontend) --------------------------
drop table if exists public.atividades cascade;
drop table if exists public.negocios   cascade;
drop table if exists public.contatos   cascade;
drop table if exists public.clientes   cascade;

-- --- profiles: cargo (título do usuário) -------------------------------------
alter table public.profiles add column if not exists cargo text;

-- handle_new_user: grava nome + cargo vindos do user_metadata no signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, cargo)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nome',
    new.raw_user_meta_data ->> 'cargo'
  )
  on conflict (id) do update
    set nome = excluded.nome, cargo = excluded.cargo;
  return new;
end;
$$;

-- =============================================================================
-- ambientes — canais de captação (Centelha, Indicação, Inbound, Evento, ...)
-- id é slug textual (usado direto na UI). Editável pelo usuário.
-- =============================================================================
create table public.ambientes (
  id          text primary key,
  name        text not null,
  short       text not null,
  color       text not null default '#8E3FC4',
  icon        text not null default 'sparkles',
  descricao   text,
  logo_url    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_ambientes_updated
  before update on public.ambientes
  for each row execute function public.set_updated_at();

alter table public.ambientes enable row level security;

create policy "ambientes_select_auth" on public.ambientes
  for select using (auth.role() = 'authenticated');
create policy "ambientes_write_auth" on public.ambientes
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================================================
-- leads — empresa/oportunidade (núcleo do CRM)
-- =============================================================================
create table public.leads (
  id             uuid primary key default gen_random_uuid(),
  company        text not null,
  seg            text,
  value          numeric(19,4) not null default 0,
  stage          text not null default 'mapeado'
                 check (stage in ('mapeado','contatado','reuniao','apresentado','proposta','perdido')),
  temp           text not null default 'morno'
                 check (temp in ('quente','morno','frio')),
  site           text,
  ambiente       text references public.ambientes (id) on delete set null,
  estado         text,
  city           text,
  employees      text,
  shipments      text,
  centelha_fase  text,
  evento_nome    text,
  indicado_por   jsonb,
  tags           jsonb not null default '[]'::jsonb,
  lost_reason    text,
  prev_stage     text,
  logo_url       text,
  owner_id       uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_leads_stage    on public.leads (stage);
create index idx_leads_ambiente on public.leads (ambiente);
create index idx_leads_owner     on public.leads (owner_id);
create index idx_leads_created   on public.leads (created_at desc);

create trigger trg_leads_updated
  before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

create policy "leads_select_auth" on public.leads
  for select using (auth.role() = 'authenticated');
create policy "leads_insert_owner" on public.leads
  for insert with check (auth.uid() = owner_id);
create policy "leads_update_auth" on public.leads
  for update using (auth.role() = 'authenticated');
create policy "leads_delete_owner" on public.leads
  for delete using (auth.uid() = owner_id);

-- =============================================================================
-- contatos — pessoas dentro de um lead (1 principal + adicionais)
-- =============================================================================
create table public.contatos (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  nome        text not null,
  cargo       text,
  email       text,
  telefone    text,
  photo       text,
  principal   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_contatos_lead on public.contatos (lead_id);

create trigger trg_contatos_updated
  before update on public.contatos
  for each row execute function public.set_updated_at();

alter table public.contatos enable row level security;

create policy "contatos_all_auth" on public.contatos
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================================================
-- tarefas — próximas ações do lead (sincroniza opcionalmente com Google)
-- =============================================================================
create table public.tarefas (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid not null references public.leads (id) on delete cascade,
  label           text not null,
  data            date,
  hora            text,
  type            text not null default 'tarefa'
                  check (type in ('tarefa','call','email','meet')),
  done            boolean not null default false,
  google_event_id text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_tarefas_lead on public.tarefas (lead_id);

create trigger trg_tarefas_updated
  before update on public.tarefas
  for each row execute function public.set_updated_at();

alter table public.tarefas enable row level security;

create policy "tarefas_all_auth" on public.tarefas
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================================================
-- atividades — timeline (notas, e-mails, ligações, reuniões, mudança de estágio)
-- O horário exibido vem de created_at.
-- =============================================================================
create table public.atividades (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  type        text not null default 'note'
              check (type in ('note','email','call','meet','stage')),
  who         text not null default 'Você',
  act         text not null,
  body        text,
  created_at  timestamptz not null default now()
);

create index idx_atividades_lead on public.atividades (lead_id, created_at desc);

alter table public.atividades enable row level security;

create policy "atividades_all_auth" on public.atividades
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================================================
-- anexos — metadados de arquivos no Storage (bucket lead-anexos)
-- =============================================================================
create table public.anexos (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  name        text not null,
  size        bigint not null default 0,
  type        text,
  path        text not null,
  created_at  timestamptz not null default now()
);

create index idx_anexos_lead on public.anexos (lead_id);

alter table public.anexos enable row level security;

create policy "anexos_all_auth" on public.anexos
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================================================
-- Seed dos ambientes padrão (editáveis depois). Não recria se já existir.
-- =============================================================================
insert into public.ambientes (id, name, short, color, icon, descricao) values
  ('centelha',  'Projeto Centelha', 'Centelha',  '#8E3FC4', 'sparkles', 'Programa de inovação · multi-estado'),
  ('indicacao', 'Indicação',        'Indicação', '#16A34A', 'users',    'Clientes e parceiros que indicam'),
  ('inbound',   'Inbound',          'Inbound',   '#2563EB', 'globe',    'Site · busca orgânica · conteúdo'),
  ('evento',    'Evento',           'Evento',    '#D97706', 'star',     'Feiras, palestras e eventos do setor')
on conflict (id) do nothing;
