import { serverSupabaseUser } from '#supabase/server'
import { useSupabaseAdmin } from '~/server/utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })

  const admin = useSupabaseAdmin()
  await admin.from('integracoes_google').delete().eq('user_id', user.id)
  return { ok: true }
})
