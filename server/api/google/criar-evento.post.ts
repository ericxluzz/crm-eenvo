import { serverSupabaseUser } from '#supabase/server'
import { useSupabaseAdmin } from '~/server/utils/supabaseAdmin'

/**
 * Cria um evento no Google Agenda do usuário (integração UNIDIRECIONAL — MVP).
 * Usa o refresh_token guardado (server-only) para obter um access_token.
 */
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })

  const body = await readBody<{ titulo: string; descricao?: string | null; inicio: string }>(event)
  if (!body?.titulo || !body?.inicio) {
    throw createError({ statusCode: 400, statusMessage: 'titulo e inicio são obrigatórios.' })
  }

  const config = useRuntimeConfig()
  const admin = useSupabaseAdmin()

  const { data: integ } = await admin
    .from('integracoes_google')
    .select('refresh_token')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!integ?.refresh_token) {
    throw createError({ statusCode: 400, statusMessage: 'Google Agenda não conectado.' })
  }

  // Troca refresh_token por access_token
  const token = await $fetch<{ access_token: string }>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.googleClientId as string,
      client_secret: config.googleClientSecret as string,
      refresh_token: integ.refresh_token as string,
      grant_type: 'refresh_token'
    }).toString()
  })

  const inicio = new Date(body.inicio)
  const fim = new Date(inicio.getTime() + 60 * 60 * 1000) // 1h de duração padrão

  const ev = await $fetch<{ id: string }>(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.access_token}` },
      body: {
        summary: body.titulo,
        description: body.descricao ?? '',
        start: { dateTime: inicio.toISOString() },
        end: { dateTime: fim.toISOString() }
      }
    }
  )

  return { eventId: ev.id }
})
