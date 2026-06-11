import { randomUUID } from 'node:crypto'
import { serverSupabaseUser } from '#supabase/server'
import { useSupabaseAdmin } from '~/server/utils/supabaseAdmin'

/**
 * Emite uma URL assinada para upload DIRETO ao Supabase Storage.
 *
 * Por que assim: a Vercel limita o corpo de funções serverless (~4,5 MB).
 * Roteando o arquivo pela função, anexos grandes (até 10 MB) quebrariam em
 * produção. Aqui a função só devolve o token/URL assinado (payload mínimo) e o
 * cliente envia os bytes direto ao Storage (supabase.storage.uploadToSignedUrl).
 */
const BUCKET = 'lead-anexos'
const MAX = 10 * 1024 * 1024 // 10 MB

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })

  const body = await readBody<{ leadId?: string; filename?: string; size?: number }>(event)
  const leadId = (body?.leadId || '').trim()
  const filename = (body?.filename || 'arquivo').trim()
  if (!leadId) throw createError({ statusCode: 400, statusMessage: 'leadId é obrigatório.' })
  if (typeof body?.size === 'number' && body.size > MAX) {
    throw createError({ statusCode: 413, statusMessage: 'Arquivo acima de 10 MB.' })
  }

  const admin = useSupabaseAdmin()

  // Garante o bucket privado (idempotente — ignora erro de "já existe").
  const { data: bucket } = await admin.storage.getBucket(BUCKET)
  if (!bucket) {
    try {
      await admin.storage.createBucket(BUCKET, { public: false, fileSizeLimit: MAX })
    } catch { /* corrida de criação: outro request já criou */ }
  }

  const safeName = filename.replace(/[^\w.\-]+/g, '_').slice(0, 80)
  const path = `leads/${leadId}/${randomUUID()}-${safeName}`

  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path)
  if (error || !data) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao preparar upload: ' + (error?.message || 'desconhecido') })
  }

  return { path: data.path, token: data.token }
})
