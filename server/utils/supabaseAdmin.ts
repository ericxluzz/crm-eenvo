import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase com privilégios de service_role.
 *
 * ⚠️ USO EXCLUSIVO NO SERVIDOR (pasta server/). Esta chave ignora o RLS.
 * NUNCA importe este arquivo em componentes, páginas ou composables do cliente.
 */
let _admin: any = null

export function useSupabaseAdmin() {
  if (_admin) return _admin

  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no servidor.')
  }

  _admin = createClient<any>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  return _admin
}
