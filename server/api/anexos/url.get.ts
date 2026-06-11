import { serverSupabaseUser } from '#supabase/server'
import { useSupabaseAdmin } from '~/server/utils/supabaseAdmin'

/** Devolve uma URL assinada (1h) para baixar um anexo do bucket privado. */
const BUCKET = 'lead-anexos'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })

  const path = getQuery(event).path
  if (!path || typeof path !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'path é obrigatório.' })
  }

  const admin = useSupabaseAdmin()
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(path, 3600)
  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Arquivo não encontrado.' })

  return { url: data.signedUrl }
})
