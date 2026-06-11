import { serverSupabaseUser } from '#supabase/server'
import { useSupabaseAdmin } from '~/server/utils/supabaseAdmin'

// Retorna se o usuário atual tem a integração Google ativa.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event).catch(() => null)
  if (!user) return { conectado: false }

  const admin = useSupabaseAdmin()
  const { data } = await admin
    .from('integracoes_google')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  return { conectado: !!data }
})
