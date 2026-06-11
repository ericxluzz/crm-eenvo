-- =============================================================================
-- Seed de exemplo — CRM eenvo (Invo)
-- Pré-requisito: já existir pelo menos 1 usuário cadastrado (auth.users + profile).
-- Os dados são vinculados ao PRIMEIRO profile encontrado.
-- Rode após o primeiro cadastro:  npx supabase db reset  (ou cole no SQL Editor)
-- =============================================================================
do $$
declare
  v_owner uuid;
  c1 uuid; c2 uuid; c3 uuid;
  n1 uuid; n2 uuid;
begin
  select id into v_owner from public.profiles order by created_at limit 1;
  if v_owner is null then
    raise notice 'Nenhum profile encontrado — cadastre um usuário antes de rodar o seed.';
    return;
  end if;

  -- Clientes
  insert into public.clientes (id, nome, email, telefone, owner_id)
  values
    (gen_random_uuid(), 'Padaria Pão Quente', 'contato@paoquente.com', '(11) 98888-1111', v_owner),
    (gen_random_uuid(), 'Construtora Alfa',   'comercial@alfa.com.br', '(11) 97777-2222', v_owner),
    (gen_random_uuid(), 'Studio Pixel',        'ola@studiopixel.io',   '(11) 96666-3333', v_owner)
  returning id into c1; -- pega o último; buscamos os demais abaixo

  select id into c1 from public.clientes where nome = 'Padaria Pão Quente' and owner_id = v_owner;
  select id into c2 from public.clientes where nome = 'Construtora Alfa' and owner_id = v_owner;
  select id into c3 from public.clientes where nome = 'Studio Pixel' and owner_id = v_owner;

  -- Contatos
  insert into public.contatos (cliente_id, nome, cargo, email, telefone) values
    (c1, 'Joana Lima', 'Proprietária', 'joana@paoquente.com', '(11) 98888-1112'),
    (c2, 'Marcos Reis', 'Diretor Comercial', 'marcos@alfa.com.br', '(11) 97777-2223');

  -- Negócios (cobre vários estágios do pipeline)
  insert into public.negocios (id, cliente_id, titulo, valor, estagio, owner_id) values
    (gen_random_uuid(), c1, 'Plano de fidelidade digital', 12000.00, 'novo', v_owner),
    (gen_random_uuid(), c2, 'Portal de obras',             85000.00, 'proposta', v_owner),
    (gen_random_uuid(), c3, 'App de portfólio',            34000.00, 'negociacao', v_owner),
    (gen_random_uuid(), c1, 'Site institucional',           9000.00, 'em_contato', v_owner),
    (gen_random_uuid(), c3, 'Identidade visual',            6000.00, 'ganho', v_owner);

  select id into n1 from public.negocios where titulo = 'Portal de obras' and owner_id = v_owner;
  select id into n2 from public.negocios where titulo = 'App de portfólio' and owner_id = v_owner;

  -- Atividades
  insert into public.atividades (cliente_id, negocio_id, tipo, titulo, descricao, vence_em, owner_id) values
    (c2, n1, 'reuniao', 'Apresentar proposta do portal', 'Reunião online via Meet', now() + interval '1 day', v_owner),
    (c3, n2, 'ligacao', 'Follow-up da negociação', 'Confirmar fechamento do escopo', now() + interval '2 hours', v_owner),
    (c1, null, 'tarefa', 'Enviar contrato de fidelidade', null, now() - interval '1 day', v_owner);
end $$;
