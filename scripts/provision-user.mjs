// Provisão do usuário único do CRM (rodar APÓS aplicar 0002_crm_real.sql).
// Uso:  node --env-file=.env scripts/provision-user.mjs <senha>
// - Remove quaisquer outros usuários (CRM de usuário único, conforme pedido).
// - Cria/atualiza contato@eenvostudio.com com nome/cargo no user_metadata.
// A SENHA vem por argumento — não fica gravada neste arquivo.
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const senha = process.argv[2]

if (!url || !key) {
  console.error('Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Rode: node --env-file=.env scripts/provision-user.mjs <senha>')
  process.exit(1)
}
if (!senha) {
  console.error('Uso: node --env-file=.env scripts/provision-user.mjs <senha>')
  process.exit(1)
}

const EMAIL = 'contato@eenvostudio.com'
const NOME = 'Eric Fernandes'
const CARGO = 'Comercial'

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

// 1. Lista usuários atuais.
const { data: list, error: lerr } = await admin.auth.admin.listUsers({ perPage: 1000 })
if (lerr) { console.error('listUsers:', lerr.message); process.exit(1) }

// 2. Remove os que não são o e-mail alvo (usuário único).
for (const u of list.users) {
  if (u.email === EMAIL) continue
  const { error } = await admin.auth.admin.deleteUser(u.id)
  console.log(error ? `falha ao remover ${u.email}: ${error.message}` : `removido: ${u.email}`)
}

// 3. Cria ou atualiza o usuário alvo.
let user = list.users.find((u) => u.email === EMAIL)
if (user) {
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    password: senha, email_confirm: true, user_metadata: { nome: NOME, cargo: CARGO }
  })
  if (error) { console.error('updateUser:', error.message); process.exit(1) }
  console.log('atualizado:', EMAIL)
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL, password: senha, email_confirm: true, user_metadata: { nome: NOME, cargo: CARGO }
  })
  if (error) { console.error('createUser:', error.message); process.exit(1) }
  user = data.user
  console.log('criado:', EMAIL)
}

// 4. Reforça o profile (o trigger já cria; garantimos nome/cargo/papel).
const { error: perr } = await admin.from('profiles')
  .update({ nome: NOME, cargo: CARGO, papel: 'admin' }).eq('id', user.id)
if (perr) console.warn('profile update:', perr.message)

console.log('OK — usuário único do CRM:', EMAIL, '·', NOME, '·', CARGO)
process.exit(0)
