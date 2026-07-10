/* Camada de dados do CRM — adaptador Supabase.
   Mantém a MESMA API pública que as telas já usam (leads/ambientes/updateLead/
   addLeadItem/...), mas lê e grava nas tabelas reais do Supabase.
   A tradução entre o shape da UI (lead.contact, lead.next, lead.contacts[]...) e o
   modelo relacional (leads + contatos/tarefas/atividades/anexos) fica toda aqui. */
import { regiao, initials as initialsOf, LOGO_COLORS, STAGES as DEFAULT_STAGES } from '~/utils/protoData'

// id (uuid/string) -> cor estável do logo
function logoColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return LOGO_COLORS[h % LOGO_COLORS.length]
}

const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
function fmtTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const hm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const dia = new Date(d); dia.setHours(0, 0, 0, 0)
  const diff = Math.round((hoje.getTime() - dia.getTime()) / 86400000)
  if (diff === 0) return `Hoje · ${hm}`
  if (diff === 1) return `Ontem · ${hm}`
  return `${d.getDate().toString().padStart(2, '0')} ${MES[d.getMonth()]} · ${hm}`
}

// Linha do banco -> objeto de lead no shape que a UI espera.
function mapLead(r: any) {
  const contatos = (r.contatos || []) as any[]
  const tarefas = (r.tarefas || []) as any[]
  const ativs = ((r.atividades || []) as any[]).slice().sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  const anexos = (r.anexos || []) as any[]

  const principal = contatos.find((c) => c.principal) || contatos[0] || null
  const todayISO = new Date().toISOString().slice(0, 10)
  const pend = tarefas.filter((t) => !t.done)

  const contacts = contatos.map((c) => ({
    id: c.id, name: c.nome, role: c.cargo, email: c.email, phone: c.telefone, photo: c.photo, principal: c.principal
  }))
  const tasks = tarefas.map((t) => ({ id: t.id, label: t.label, date: t.data, time: t.hora, type: t.type, done: t.done }))
  const activities = ativs.map((a) => ({ id: a.id, type: a.type, who: a.who, act: a.act, body: a.body, time: fmtTime(a.created_at), at: a.created_at }))
  const attachments = anexos.map((a) => ({ id: a.id, name: a.name, size: a.size, type: a.type, path: a.path, at: a.created_at }))

  const next = pend[0]
    ? { label: pend[0].label, date: pend[0].data || '', due: !!(pend[0].data && pend[0].data <= todayISO) }
    : { label: '', date: '', due: false }

  return {
    id: r.id, company: r.company, seg: r.seg, value: Number(r.value) || 0, stage: r.stage, temp: r.temp || 'morno',
    site: r.site, ambiente: r.ambiente, estado: r.estado, city: r.city, employees: r.employees, shipments: r.shipments,
    faturamento: r.faturamento != null ? Number(r.faturamento) : null, instagram: r.instagram, plataforma: r.plataforma,
    resumo: r.resumo || '',
    centelhaFase: r.centelha_fase, eventoNome: r.evento_nome, indicadoPor: r.indicado_por,
    tags: r.tags || [], lostReason: r.lost_reason, prevStage: r.prev_stage, logoUrl: r.logo_url,
    created: r.created_at ? r.created_at.slice(0, 10) : '',
    logo: logoColor(r.id), initials: initialsOf(r.company || '?'), regiao: regiao(r.estado || ''),
    contact: principal
      ? { name: principal.nome, role: principal.cargo, email: principal.email, phone: principal.telefone, photo: principal.photo }
      : { name: '', role: '', email: '', phone: '' },
    next, contacts, tasks, activities, attachments
  }
}

function mapAmb(a: any) {
  return { id: a.id, name: a.name, short: a.short, color: a.color, icon: a.icon, desc: a.descricao, logoUrl: a.logo_url }
}

// Colunas escalares de lead que o updateLead aceita (UI key -> coluna).
const LEAD_COL: Record<string, string> = {
  company: 'company', site: 'site', seg: 'seg', value: 'value', stage: 'stage', temp: 'temp',
  ambiente: 'ambiente', estado: 'estado', city: 'city', employees: 'employees', shipments: 'shipments',
  lostReason: 'lost_reason', prevStage: 'prev_stage', logoUrl: 'logo_url',
  centelhaFase: 'centelha_fase', eventoNome: 'evento_nome', tags: 'tags', indicadoPor: 'indicado_por',
  faturamento: 'faturamento', instagram: 'instagram', plataforma: 'plataforma', resumo: 'resumo'
}
const ITEM_TABLE: Record<string, string> = { contacts: 'contatos', tasks: 'tarefas', activities: 'atividades', attachments: 'anexos' }

export function useCrm() {
  const supabase = useSupabaseClient() as any

  const { data: leadsRaw, refresh: refreshLeads } = useAsyncData('crm-leads', async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*, contatos(*), tarefas(*), atividades(*), anexos(*)')
      .order('created_at', { ascending: false })
    if (error) { console.error('[useCrm] leads:', error.message); return [] as any[] }
    return (data as any[]) || []
  }, { default: () => [] as any[] })

  const { data: ambsRaw, refresh: refreshAmbs } = useAsyncData('crm-ambientes', async () => {
    const { data, error } = await supabase.from('ambientes').select('*').order('name')
    if (error) { console.error('[useCrm] ambientes:', error.message); return [] as any[] }
    return (data as any[]) || []
  }, { default: () => [] as any[] })

  // ---- Stages (etapas do funil) — do banco, com fallback aos padrões ----
  const { data: stagesRaw, refresh: refreshStages } = useAsyncData('crm-stages', async () => {
    const { data, error } = await supabase.from('stages').select('*').order('ordem')
    if (error) { console.error('[useCrm] stages:', error.message); return null }
    return data as any[]
  }, { default: () => null })

  const leads = computed(() => (leadsRaw.value || []).map(mapLead))
  const ambientes = computed(() => (ambsRaw.value || []).map(mapAmb))
  function ambById(id: string) { return ambientes.value.find((a) => a.id === id) }

  const stages = computed<any[]>(() => {
    const rows = (stagesRaw.value && stagesRaw.value.length)
      ? stagesRaw.value.map((s: any) => ({ id: s.id, name: s.name, color: s.color, ordem: s.ordem, fixo: s.fixo, terminal: s.terminal }))
      : DEFAULT_STAGES.map((s: any, i: number) => ({ id: s.id, name: s.name, color: s.color, ordem: i + 1, fixo: s.id === 'perdido' || s.id === 'pagamento-realizado', terminal: s.id === 'perdido' ? 'perdido' : s.id === 'pagamento-realizado' ? 'ganho' : null }))
    // não-terminais por ordem; terminais (perdido) sempre por último
    return [...rows.filter((s: any) => !s.terminal).sort((a: any, b: any) => a.ordem - b.ordem), ...rows.filter((s: any) => s.terminal)]
  })
  const openStages = computed(() => stages.value.filter((s) => !s.terminal))
  function stageById(id: string) { return stages.value.find((s) => s.id === id) }
  function stageName(id: string) { return stageById(id)?.name || id }
  function stageColor(id: string) { return stageById(id)?.color || '#8A8F99' }
  function stageChip(id: string): [string, string] { const c = stageColor(id); return [c + '1A', c] }

  // ---- Escrita: leads ----
  async function updateLead(id: string, patch: Record<string, any>) {
    const dbPatch: Record<string, any> = {}
    for (const k in patch) if (k in LEAD_COL) dbPatch[LEAD_COL[k]] = patch[k]
    if (Object.keys(dbPatch).length) {
      const { error } = await supabase.from('leads').update(dbPatch).eq('id', id)
      if (error) console.error('[useCrm] updateLead:', error.message)
    }
    // patch.contact -> atualiza/insere o contato principal
    if (patch.contact) {
      const lead = leads.value.find((l) => l.id === id)
      const pid = lead?.contacts.find((c: any) => c.principal)?.id || lead?.contacts[0]?.id
      const c = patch.contact
      if (pid) await supabase.from('contatos').update({ nome: c.name, cargo: c.role, email: c.email, telefone: c.phone }).eq('id', pid)
      else await supabase.from('contatos').insert({ lead_id: id, nome: c.name, cargo: c.role, email: c.email, telefone: c.phone, principal: true })
    }
    await refreshLeads()
  }

  // Único caminho pra trocar o estágio de um lead: sempre grava o novo stage
  // E loga uma atividade type='stage' na mesma chamada — nenhuma tela (kanban,
  // detalhe do lead) deve chamar updateLead({stage: ...}) diretamente.
  async function moverEstagio(id: string, novoStageId: string, opts?: { motivo?: string; origem?: string }) {
    const lead = leads.value.find((l) => l.id === id)
    if (!lead || lead.stage === novoStageId) return
    const destino = stageById(novoStageId)
    const patch: Record<string, any> = { stage: novoStageId }
    if (destino?.terminal === 'perdido') { patch.lostReason = opts?.motivo || 'Não informado'; patch.prevStage = lead.stage }
    await updateLead(id, patch)
    const via = opts?.origem ? ` (${opts.origem})` : ''
    await addLeadItem(id, 'activities', {
      id: crypto.randomUUID(), type: 'stage', who: 'Você',
      act: 'moveu para ' + (destino?.name || novoStageId) + via,
      body: opts?.motivo ? 'Motivo: ' + opts.motivo : ''
    })
  }

  async function createLead(input: any) {
    const { data, error } = await supabase.from('leads').insert({
      company: input.company, site: input.site || null, seg: input.seg || null,
      value: Number(input.value) || 0, stage: input.stage || 'mapeado', temp: input.temp || 'morno',
      ambiente: input.ambiente || null, estado: input.estado || null,
      indicado_por: input.indicadoPor || null, tags: input.tags || []
    }).select('id').single()
    if (error) { console.error('[useCrm] createLead:', error.message); throw error }
    if (data && (input.contactName || input.contactRole)) {
      await supabase.from('contatos').insert({
        lead_id: data.id, nome: input.contactName || 'Contato', cargo: input.contactRole || null,
        email: input.contactEmail || null, telefone: input.contactPhone || null, principal: true
      })
    }
    await refreshLeads()
    return data?.id as string
  }

  async function deleteLead(id: string) {
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) console.error('[useCrm] deleteLead:', error.message)
    await refreshLeads()
  }

  // ---- Escrita: itens (contatos/tarefas/atividades/anexos) ----
  async function addLeadItem(id: string, field: string, item: any, _arr?: any[]) {
    const t = ITEM_TABLE[field]
    if (!t) return
    let row: any = { lead_id: id }
    if (field === 'contacts') row = { lead_id: id, nome: item.name, cargo: item.role, email: item.email, telefone: item.phone, photo: item.photo || null, principal: !!item.principal }
    else if (field === 'tasks') row = { lead_id: id, label: item.label, data: item.date || null, hora: item.time || null, type: item.type || 'tarefa', done: !!item.done }
    else if (field === 'activities') row = { lead_id: id, type: item.type || 'note', who: item.who || 'Você', act: item.act || '', body: item.body || '' }
    else if (field === 'attachments') row = { lead_id: id, name: item.name, size: item.size || 0, type: item.type || '', path: item.path }
    const { error } = await supabase.from(t).insert(row)
    if (error) console.error('[useCrm] addLeadItem:', error.message)
    await refreshLeads()
  }

  async function updateLeadItem(id: string, field: string, itemId: string, patch: any, _arr?: any[]) {
    const t = ITEM_TABLE[field]
    if (!t) return
    let up: any = {}
    if (field === 'contacts') { up = {}; if ('name' in patch) up.nome = patch.name; if ('role' in patch) up.cargo = patch.role; if ('email' in patch) up.email = patch.email; if ('phone' in patch) up.telefone = patch.phone }
    else if (field === 'tasks') { up = {}; if ('label' in patch) up.label = patch.label; if ('date' in patch) up.data = patch.date || null; if ('time' in patch) up.hora = patch.time || null; if ('type' in patch) up.type = patch.type; if ('done' in patch) up.done = patch.done }
    else up = patch
    const { error } = await supabase.from(t).update(up).eq('id', itemId)
    if (error) console.error('[useCrm] updateLeadItem:', error.message)
    await refreshLeads()
  }

  async function removeLeadItem(id: string, field: string, itemId: string, _arr?: any[]) {
    const t = ITEM_TABLE[field]
    if (!t) return
    const { error } = await supabase.from(t).delete().eq('id', itemId)
    if (error) console.error('[useCrm] removeLeadItem:', error.message)
    await refreshLeads()
  }

  // `next` é derivado das tarefas pendentes — não há o que gravar. No-op (mantém a API).
  function setLeadNext(_id: string, _task: any) { /* derivado de tarefas */ }

  const setLeadLogo = (id: string, url: string | null) => updateLead(id, { logoUrl: url })

  // ---- Escrita: ambientes ----
  async function updateAmbiente(id: string, patch: Record<string, any>) {
    const up: Record<string, any> = {}
    if ('name' in patch) up.name = patch.name
    if ('short' in patch) up.short = patch.short
    if ('desc' in patch) up.descricao = patch.desc
    if ('color' in patch) up.color = patch.color
    if ('icon' in patch) up.icon = patch.icon
    if ('logoUrl' in patch) up.logo_url = patch.logoUrl
    if (Object.keys(up).length) {
      const { error } = await supabase.from('ambientes').update(up).eq('id', id)
      if (error) console.error('[useCrm] updateAmbiente:', error.message)
    }
    await refreshAmbs()
  }

  async function createAmbiente(input: any) {
    const slug = (input.id || input.short || input.name || '')
      .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || ('amb-' + Math.abs(Date.now() % 100000))
    const { error } = await supabase.from('ambientes').insert({
      id: slug, name: input.name, short: input.short || input.name, color: input.color || '#8E3FC4',
      icon: input.icon || 'sparkles', descricao: input.desc || null
    })
    if (error) { console.error('[useCrm] createAmbiente:', error.message); throw error }
    await refreshAmbs()
    return slug
  }

  const setAmbLogo = (id: string, url: string | null) => updateAmbiente(id, { logoUrl: url })

  // ---- Escrita: stages ----
  async function createStage(input: { name: string; color?: string }) {
    let slug = (input.name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || ('etapa-' + Math.abs(Date.now() % 100000))
    if (stages.value.some((s) => s.id === slug)) slug = slug + '-' + Math.abs(Date.now() % 1000)
    const ordem = Math.max(0, ...openStages.value.map((s) => s.ordem)) + 1
    const { error } = await supabase.from('stages').insert({ id: slug, name: input.name, color: input.color || '#8A8F99', ordem })
    if (error) { console.error('[useCrm] createStage:', error.message); throw error }
    await refreshStages()
    return slug
  }
  async function updateStage(id: string, patch: { name?: string; color?: string }) {
    const up: any = {}
    if ('name' in patch) up.name = patch.name
    if ('color' in patch) up.color = patch.color
    if (Object.keys(up).length) {
      const { error } = await supabase.from('stages').update(up).eq('id', id)
      if (error) console.error('[useCrm] updateStage:', error.message)
    }
    await refreshStages()
  }
  async function deleteStage(id: string) {
    const s = stageById(id)
    if (s?.fixo) throw new Error('Esta etapa é fixa e não pode ser excluída.')
    const usados = leads.value.filter((l) => l.stage === id).length
    if (usados > 0) throw new Error(`Mova os ${usados} lead(s) desta etapa antes de excluí-la.`)
    const { error } = await supabase.from('stages').delete().eq('id', id)
    if (error) { console.error('[useCrm] deleteStage:', error.message); throw error }
    await refreshStages()
  }
  async function reorderStages(orderedIds: string[]) {
    await Promise.all(orderedIds.map((id, i) => supabase.from('stages').update({ ordem: i + 1 }).eq('id', id)))
    await refreshStages()
  }

  // Dias desde a última mudança de estágio (fallback: data de criação do lead).
  // Depende de moverEstagio() sempre logar uma atividade type='stage'.
  function stageSince(lead: any): string {
    const stageAct = (lead.activities || []).find((a: any) => a.type === 'stage' && a.at)
    if (stageAct) return stageAct.at
    return lead.created ? lead.created + 'T00:00:00' : ''
  }
  function daysInStage(lead: any): number {
    const since = stageSince(lead)
    if (!since) return 0
    return Math.max(0, Math.floor((Date.now() - new Date(since).getTime()) / 86400000))
  }

  async function refreshCrm() { await Promise.all([refreshLeads(), refreshAmbs(), refreshStages()]) }

  return {
    leads, ambientes, ambById,
    stages, openStages, stageById, stageName, stageColor, stageChip,
    updateLead, createLead, deleteLead, moverEstagio,
    addLeadItem, updateLeadItem, removeLeadItem, setLeadNext, setLeadLogo,
    updateAmbiente, createAmbiente, setAmbLogo,
    createStage, updateStage, deleteStage, reorderStages,
    stageSince, daysInStage,
    refreshCrm
  }
}

// Compat: o plugin antigo chamava hydrateCrm(); agora é no-op (dados vêm do Supabase).
export function hydrateCrm() { /* no-op — migrado para Supabase */ }
