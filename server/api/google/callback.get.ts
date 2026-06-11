import { useSupabaseAdmin } from '~/server/utils/supabaseAdmin'

// Callback do OAuth Google: troca o code pelo refresh_token e persiste (server-only).
export default defineEventHandler(async (event) => {
  const { code, state } = getQuery(event)
  const config = useRuntimeConfig()

  if (!code || !state) {
    throw createError({ statusCode: 400, statusMessage: 'Callback do Google inválido.' })
  }

  const token = await $fetch<{
    access_token: string
    refresh_token?: string
    expires_in: number
  }>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: String(code),
      client_id: config.googleClientId as string,
      client_secret: config.googleClientSecret as string,
      redirect_uri: config.googleRedirectUri as string,
      grant_type: 'authorization_code'
    }).toString()
  })

  if (!token.refresh_token) {
    // Sem refresh_token (consent já dado antes); orienta reconsentir.
    return sendRedirect(event, '/agenda?google=sem_refresh')
  }

  const admin = useSupabaseAdmin()
  await admin.from('integracoes_google').upsert({
    user_id: String(state),
    refresh_token: token.refresh_token,
    conectado_em: new Date().toISOString()
  })

  return sendRedirect(event, '/agenda?google=ok')
})
