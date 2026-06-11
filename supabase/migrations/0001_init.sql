-- =============================================================================
-- CRM eenvo — Migration inicial
-- App interno single-tenant. RLS habilitado em TODAS as tabelas.
-- Padrão: id uuid, created_at, updated_at, FKs com ON DELETE, índices.
-- =============================================================================

-- Extensões -------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- Função utilitária: atualiza updated_at automaticamente -----------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- profiles — 1:1 com auth.users. Guarda papel/role do usuário interno.
-- =============================================================================
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text,
  papel       text not null default 'membro' check (papel in ('admin', 'membro')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada usuário lê/edita o próprio profile.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Cria o profile automaticamente quando um usuário se cadastra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, new.raw_user_meta_data ->> 'nome');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- clientes
-- =============================================================================
create table public.clientes (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  email       text,
  telefone    text,
  owner_id    uuid not null references public.profiles (id) on delete restrict,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_clientes_owner on public.clientes (owner_id);
create index idx_clientes_created on public.clientes (created_at desc);

create trigger trg_clientes_updated
  before update on public.clientes
  for each row execute function public.set_updated_at();

alter table public.clientes enable row level security;

-- App interno: qualquer usuário autenticado vê todos os clientes.
-- (Se quiser restringir por dono, troque por: auth.uid() = owner_id)
create policy "clientes_select_auth" on public.clientes
  for select using (auth.role() = 'authenticated');
create policy "clientes_insert_auth" on public.clientes
  for insert with check (auth.uid() = owner_id);
create policy "clientes_update_auth" on public.clientes
  for update using (auth.role() = 'authenticated');
create policy "clientes_delete_owner" on public.clientes
  for delete using (auth.uid() = owner_id);

-- =============================================================================
-- contatos — pessoas dentro de um cliente
-- =============================================================================
create table public.contatos (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references public.clientes (id) on delete cascade,
  nome        text not null,
  cargo       text,
  email       text,
  telefone    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_contatos_cliente on public.contatos (cliente_id);

create trigger trg_contatos_updated
  before update on public.contatos
  for each row execute function public.set_updated_at();

alter table public.contatos enable row level security;

create policy "contatos_all_auth" on public.contatos
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================================================
-- negocios — pipeline / oportunidades
-- Valores monetários em DECIMAL(19,4), NUNCA float.
-- =============================================================================
create table public.negocios (
  id           uuid primary key default gen_random_uuid(),
  cliente_id   uuid not null references public.clientes (id) on delete cascade,
  titulo       text not null,
  valor        decimal(19,4) not null default 0,
  -- 6 estágios do pipeline (Discovery Invo)
  estagio      text not null default 'novo'
               check (estagio in ('novo', 'em_contato', 'proposta', 'negociacao', 'ganho', 'perdido')),
  -- motivo registrado quando estágio = perdido
  motivo_perda text
               check (motivo_perda is null or motivo_perda in ('preco', 'timing', 'concorrente', 'sem_resposta', 'outro')),
  owner_id     uuid not null references public.profiles (id) on delete restrict,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_negocios_cliente on public.negocios (cliente_id);
create index idx_negocios_estagio on public.negocios (estagio);
create index idx_negocios_owner on public.negocios (owner_id);

create trigger trg_negocios_updated
  before update on public.negocios
  for each row execute function public.set_updated_at();

alter table public.negocios enable row level security;

create policy "negocios_select_auth" on public.negocios
  for select using (auth.role() = 'authenticated');
create policy "negocios_insert_auth" on public.negocios
  for insert with check (auth.uid() = owner_id);
create policy "negocios_update_auth" on public.negocios
  for update using (auth.role() = 'authenticated');
create policy "negocios_delete_owner" on public.negocios
  for delete using (auth.uid() = owner_id);

-- =============================================================================
-- atividades — tarefas / follow-ups
-- =============================================================================
create table public.atividades (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid references public.clientes (id) on delete cascade,
  negocio_id      uuid references public.negocios (id) on delete cascade,
  tipo            text not null default 'tarefa'
                  check (tipo in ('tarefa', 'ligacao', 'email', 'reuniao')),
  titulo          text not null,
  descricao       text,
  concluida       boolean not null default false,
  vence_em        timestamptz,
  -- id do evento criado no Google Agenda (integração unidirecional MVP)
  google_event_id text,
  owner_id        uuid not null references public.profiles (id) on delete restrict,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_atividades_owner on public.atividades (owner_id);
create index idx_atividades_vence on public.atividades (vence_em);

create trigger trg_atividades_updated
  before update on public.atividades
  for each row execute function public.set_updated_at();

alter table public.atividades enable row level security;

create policy "atividades_select_auth" on public.atividades
  for select using (auth.role() = 'authenticated');
create policy "atividades_insert_auth" on public.atividades
  for insert with check (auth.uid() = owner_id);
create policy "atividades_update_auth" on public.atividades
  for update using (auth.role() = 'authenticated');
create policy "atividades_delete_owner" on public.atividades
  for delete using (auth.uid() = owner_id);

-- =============================================================================
-- integracoes_google — tokens OAuth da integração com Google Agenda
-- ⚠️ Acesso SOMENTE pelo servidor (service_role). RLS nega tudo ao cliente.
-- =============================================================================
create table public.integracoes_google (
  user_id        uuid primary key references public.profiles (id) on delete cascade,
  refresh_token  text not null,
  email_google   text,
  conectado_em   timestamptz not null default now()
);

alter table public.integracoes_google enable row level security;
-- Nenhuma policy criada de propósito: com RLS ligado e sem policies,
-- o cliente (anon/authenticated) não acessa nada. Só a service_role passa.
