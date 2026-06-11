import { serverSupabaseUser } from '#supabase/server'

// Inicia o fluxo OAuth do Google (consent screen).
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })

  const config = useRuntimeConfig()
  if (!config.googleClientId || !config.googleRedirectUri) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Integração Google não configurada (GOOGLE_CLIENT_ID / GOOGLE_REDIRECT_URI).'
    })
  }

  const params = new URLSearchParams({
    client_id: config.googleClientId as string,
    redirect_uri: config.googleRedirectUri as string,
    response_type: 'code',
    // Somente leitura: o CRM apenas REFLETE a agenda do Google, nunca cria/edita.
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    access_type: 'offline',
    prompt: 'consent',
    state: user.id // associa o callback ao usuário
  })

  return sendRedirect(event, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
})
