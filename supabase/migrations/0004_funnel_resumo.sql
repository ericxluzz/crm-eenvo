-- =============================================================================
-- CRM eenvo — Migration 0004: funil de vendas real + campo "resumo do projeto"
-- Reseed de stages para o funil: Não contatado → Contatado → Sem resposta →
-- Respondeu → Reunião marcada → Proposta enviada → Pagamento realizado | Perdido.
--
-- A etapa "Pagamento realizado" já existe (criada manualmente pela tela de
-- Configurações, id `pagamento-realizado`), mas hoje não é terminal — não entra
-- no cálculo de conversão, não tira o lead da lista de "abertos", e não trava
-- edição como "Perdido" trava. Esta migration promove ela a terminal (ganho),
-- em vez de criar um "Fechado" novo e duplicado.
--
-- Idempotente onde possível. Rodar no SQL Editor do Supabase.
-- =============================================================================

-- --- leads: campo de resumo do projeto, separado da timeline de atividades ---
alter table public.leads add column if not exists resumo text;

-- --- remapeia os leads existentes do vocabulário antigo pro novo ------------
update public.leads set stage = 'nao_contatado'   where stage = 'mapeado';
update public.leads set stage = 'reuniao_marcada' where stage = 'reuniao';
update public.leads set stage = 'respondeu'       where stage = 'apresentado';
update public.leads set stage = 'proposta_enviada' where stage = 'proposta';
-- 'contatado', 'perdido' e 'pagamento-realizado' mantêm o mesmo id.

-- --- novo funil (upsert; mantém compatível com stages já usada por outros) --
insert into public.stages (id, name, color, ordem, fixo, terminal) values
  ('nao_contatado',    'Não contatado',     '#94A3B8', 1, false, null),
  ('contatado',        'Contatado',         '#2563EB', 2, false, null),
  ('sem_resposta',     'Sem resposta',      '#F59E0B', 3, false, null),
  ('respondeu',        'Respondeu',         '#0891B2', 4, false, null),
  ('reuniao_marcada',  'Reunião marcada',   '#8E3FC4', 5, false, null),
  ('proposta_enviada', 'Proposta enviada',  '#DB2777', 6, false, null),
  ('perdido',          'Perdido',           '#DC2626', 8, true,  'perdido')
on conflict (id) do update
  set name = excluded.name, color = excluded.color, ordem = excluded.ordem,
      fixo = excluded.fixo, terminal = excluded.terminal;

-- --- promove "Pagamento realizado" a estágio terminal (ganho) ---------------
update public.stages
  set fixo = true, terminal = 'ganho', ordem = 7
  where id = 'pagamento-realizado';

-- --- remove as etapas antigas que não fazem mais parte do funil -------------
-- (só remove se nenhum lead ainda referenciar o id — não perde dado)
delete from public.stages s
where s.id in ('mapeado', 'reuniao', 'apresentado', 'proposta')
  and not exists (select 1 from public.leads l where l.stage = s.id);
