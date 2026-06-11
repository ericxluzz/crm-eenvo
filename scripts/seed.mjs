// Seed via REST (service_role) — replica supabase/seed.sql sem depender do SQL Editor.
const URL = 'https://pfljmxhtmzjcyvmkpkbq.supabase.co';
const SR = process.env.SR;
const h = {
  apikey: SR,
  Authorization: `Bearer ${SR}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function post(table, rows) {
  const r = await fetch(`${URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify(rows),
  });
  if (!r.ok) throw new Error(`${table}: ${r.status} ${await r.text()}`);
  return r.json();
}

const owner = 'cac7f427-56f9-466b-9e43-a3ea8a931fac';

// Idempotência simples: se já houver clientes desse owner, não duplica.
const existing = await (await fetch(
  `${URL}/rest/v1/clientes?select=id&owner_id=eq.${owner}&limit=1`,
  { headers: h }
)).json();
if (existing.length) {
  console.log('Seed já aplicado (clientes existentes). Nada a fazer.');
  process.exit(0);
}

const clientes = await post('clientes', [
  { nome: 'Padaria Pão Quente', email: 'contato@paoquente.com', telefone: '(11) 98888-1111', owner_id: owner },
  { nome: 'Construtora Alfa', email: 'comercial@alfa.com.br', telefone: '(11) 97777-2222', owner_id: owner },
  { nome: 'Studio Pixel', email: 'ola@studiopixel.io', telefone: '(11) 96666-3333', owner_id: owner },
]);
const byName = (n) => clientes.find((c) => c.nome === n).id;
const c1 = byName('Padaria Pão Quente');
const c2 = byName('Construtora Alfa');
const c3 = byName('Studio Pixel');

await post('contatos', [
  { cliente_id: c1, nome: 'Joana Lima', cargo: 'Proprietária', email: 'joana@paoquente.com', telefone: '(11) 98888-1112' },
  { cliente_id: c2, nome: 'Marcos Reis', cargo: 'Diretor Comercial', email: 'marcos@alfa.com.br', telefone: '(11) 97777-2223' },
]);

const negocios = await post('negocios', [
  { cliente_id: c1, titulo: 'Plano de fidelidade digital', valor: 12000.0, estagio: 'novo', owner_id: owner },
  { cliente_id: c2, titulo: 'Portal de obras', valor: 85000.0, estagio: 'proposta', owner_id: owner },
  { cliente_id: c3, titulo: 'App de portfólio', valor: 34000.0, estagio: 'negociacao', owner_id: owner },
  { cliente_id: c1, titulo: 'Site institucional', valor: 9000.0, estagio: 'em_contato', owner_id: owner },
  { cliente_id: c3, titulo: 'Identidade visual', valor: 6000.0, estagio: 'ganho', owner_id: owner },
]);
const negByTitle = (t) => negocios.find((n) => n.titulo === t).id;
const n1 = negByTitle('Portal de obras');
const n2 = negByTitle('App de portfólio');

await post('atividades', [
  { cliente_id: c2, negocio_id: n1, tipo: 'reuniao', titulo: 'Apresentar proposta do portal', descricao: 'Reunião online via Meet', vence_em: new Date(Date.now() + 864e5).toISOString(), owner_id: owner },
  { cliente_id: c3, negocio_id: n2, tipo: 'ligacao', titulo: 'Follow-up da negociação', descricao: 'Confirmar fechamento do escopo', vence_em: new Date(Date.now() + 72e5).toISOString(), owner_id: owner },
  { cliente_id: c1, negocio_id: null, tipo: 'tarefa', titulo: 'Enviar contrato de fidelidade', descricao: null, vence_em: new Date(Date.now() - 864e5).toISOString(), owner_id: owner },
]);

console.log('Seed aplicado: 3 clientes, 2 contatos, 5 negócios, 3 atividades.');
