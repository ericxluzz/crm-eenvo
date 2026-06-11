import { serverSupabaseUser } from '#supabase/server'
import { useSupabaseAdmin } from '~/server/utils/supabaseAdmin'

/**
 * Lista (somente leitura) os eventos do Google Agenda do usuário num intervalo.
 * Espelho: o CRM nunca cria/edita — apenas reflete o que existe no Google.
 * Query: timeMin, timeMax (ISO). Retorna { conectado, eventos[] }.
 */
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event).catch(() => null)
  if (!user) return { conectado: false, eventos: [] }

  const admin = useSupabaseAdmin()
  const { data: integ } = await admin
    .from('integracoes_google')
    .select('refresh_token')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!integ?.refresh_token) return { conectado: false, eventos: [] }

  const config = useRuntimeConfig()
  const q = getQuery(event)

  // refresh_token -> access_token
  let access: string
  try {
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
    access = token.access_token
  } catch {
    return { conectado: true, erro: 'auth', eventos: [] }
  }

  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
    timeMin: String(q.timeMin || new Date().toISOString()),
    timeMax: String(q.timeMax || '')
  })
  if (!q.timeMax) params.delete('timeMax')

  let items: any[] = []
  try {
    const res = await $fetch<{ items?: any[] }>(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      { headers: { Authorization: `Bearer ${access}` } }
    )
    items = res.items ?? []
  } catch {
    return { conectado: true, erro: 'fetch', eventos: [] }
  }

  const eventos = items.map((it) => ({
    id: it.id,
    title: it.summary || '(sem título)',
    start: it.start?.dateTime || it.start?.date || null,
    end: it.end?.dateTime || it.end?.date || null,
    allDay: !it.start?.dateTime,
    location: it.location || it.hangoutLink || ''
  }))

  return { conectado: true, eventos }
})
