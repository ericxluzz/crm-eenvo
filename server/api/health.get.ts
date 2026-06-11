// Healthcheck leve para keep-alive (evita cold start na Vercel via uptime monitor).
export default defineEventHandler(() => ({
  status: 'ok',
  ts: new Date().toISOString(),
  region: process.env.VERCEL_REGION ?? 'local'
}))
