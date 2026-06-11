<template>
  <div class="screen content-pad" style="max-width:none">
    <div class="page-head">
      <div class="pt">
        <h1>Pipeline comercial</h1>
        <p class="sub">{{ open.length }} negócios abertos · {{ fmtBRL(totalValue) }} em MRR potencial</p>
      </div>
    </div>

    <PipelineToolbar
      v-model:view="view"
      v-model:show-filters="showFilters"
      v-model:sort="sort"
      v-model:group-by="groupBy"
      v-model:q="q"
      v-model:amb-filter="ambFilter"
      :stage-sel="stageSel" :regiao-sel="regiaoSel" :temp-sel="tempSel"
      :ambientes="ambientes" :stages="stages" :regioes="REGIOES"
      :groups="groups" :active-count="activeCount"
      @toggle-stage="toggleArr(stageSel, $event)"
      @toggle-regiao="toggleArr(regiaoSel, $event)"
      @toggle-temp="toggleArr(tempSel, $event)"
      @clear="clearFilters"
      @new="openNewLead"
    />

    <!-- QUADRO -->
    <div v-if="view === 'board'" class="kanban-wrap">
      <div class="kanban">
        <div
          v-for="col in columns" :key="col.id" class="kcol" :class="{ 'drag-over': over === col.id }"
          @dragover.prevent="over = col.id" @dragleave="onLeave($event, col.id)" @drop="onDrop(col.id)"
        >
          <div class="kcol-head">
            <span class="kstage" :style="{ background: col.chip[0], color: col.chip[1] }">
              <span class="d" />{{ col.name }}<span class="ct">{{ colLeads(col.id).length }}</span>
            </span>
            <div class="flex aic gap8">
              <span class="sum">{{ colSum(col.id) ? fmtBRL(colSum(col.id)) : '' }}</span>
              <button class="kcol-plus" title="Novo lead" @click="openNewLead"><Icon name="plus" :size="15" /></button>
            </div>
          </div>
          <div class="kcol-body">
            <KCard
              v-for="l in colLeads(col.id)" :key="l.id" :lead="l" :dragging="drag === l.id"
              @open="openLead" @dragstart="onDragStart" @dragend="onDragEnd"
            />
            <div v-if="colLeads(col.id).length === 0" style="font-size:12.5px;color:var(--ink-3);text-align:center;padding:18px 0">Vazio</div>
          </div>
        </div>
      </div>
    </div>

    <!-- LISTA -->
    <div v-else>
      <div class="card">
        <div style="overflow-x:auto">
          <table class="tbl pp-list">
            <thead>
              <tr>
                <th class="pp-sortable" @click="setSort('company')">Empresa <Icon v-if="sort === 'company'" name="arrow-down" :size="12" /></th>
                <th>Estágio</th>
                <th>Ambiente</th>
                <th>Região</th>
                <th class="ta-r pp-sortable" @click="setSort('value')">MRR <Icon v-if="sort === 'value'" name="arrow-down" :size="12" /></th>
                <th>Próxima ação</th>
                <th>Contato</th>
                <th>Temp.</th>
                <th style="width:36px" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in paged" :key="l.id" @click="openLead(l.id)">
                <td>
                  <div class="flex aic" style="gap:11px">
                    <CompanyLogo :lead="l" />
                    <div><div class="cell-strong">{{ l.company }}</div><div class="cell-mute" style="font-size:12px">{{ l.seg }}</div></div>
                  </div>
                </td>
                <td><StageBadge :stage="l.stage" /></td>
                <td><AmbienteTag :id="l.ambiente" size="sm" /></td>
                <td><span style="font-size:13px">{{ l.estado }} · {{ l.regiao }}</span></td>
                <td class="cell-strong ta-r" style="font-family:var(--font-mono)">{{ fmtBRL(l.value) }}</td>
                <td><span class="cell-mute" style="font-size:13px">{{ l.next && l.next.label !== '—' ? l.next.label : '—' }}</span></td>
                <td>
                  <div class="flex aic gap8"><EAvatar :name="l.contact.name" :photo="l.contact.photo" :size="26" /><span style="font-size:13px">{{ l.contact.name.split(' ')[0] }}</span></div>
                </td>
                <td><span class="pp-temp" :style="{ color: TEMPC[l.temp] }"><span class="pp-tdot" :style="{ background: TEMPC[l.temp] }" />{{ l.temp }}</span></td>
                <td><Icon name="chevron-right" :size="16" style="color:var(--ink-3)" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="filtered.length === 0" class="empty" style="padding:40px 0">Nenhum lead encontrado com os filtros atuais.</div>
      </div>

      <div class="pp-foot">
        <span class="muted" style="font-size:12.5px">Mostrando <b style="color:var(--ink)">{{ paged.length }}</b> de <b style="color:var(--ink)">{{ filtered.length }}</b> leads</span>
        <div v-if="totalPages > 1" class="flex aic gap8">
          <button class="btn btn-secondary btn-sm" :disabled="page === 1" @click="page--"><Icon name="chevron-right" :size="15" style="transform:rotate(180deg)" /> Anterior</button>
          <span class="muted" style="font-size:12.5px">Página {{ page }} / {{ totalPages }}</span>
          <button class="btn btn-secondary btn-sm" :disabled="page === totalPages" @click="page++">Próxima <Icon name="chevron-right" :size="15" /></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fmtBRL } from '~/utils/protoData'

const REGIAO_CHIP: Record<string, string[]> = {
  Sudeste: ['#F3EAFB', '#7A2FAE'], Sul: ['#EFF4FF', '#2563EB'],
  Nordeste: ['#FFF6EC', '#B45309'], 'Centro-Oeste': ['#ECFDF3', '#16A34A'], Norte: ['#ECFEFF', '#0E7490']
}
const TEMPC: Record<string, string> = { quente: '#DC2626', morno: '#D97706', frio: '#2563EB' }
const REGIOES = ['Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste', 'Norte']
const groups = [{ k: 'stage', l: 'Estágio' }, { k: 'ambiente', l: 'Ambiente' }, { k: 'regiao', l: 'Região' }]
const PAGE_SIZE = 50

const { openNewLead } = useOverlays()
const { leads, ambientes, updateLead, stages, stageChip } = useCrm()

const drag = ref<string | null>(null)
const over = ref<string | null>(null)
const view = ref<'board' | 'list'>('board')
const showFilters = ref(false)
const sort = ref<'value' | 'recent' | 'company'>('value')
const groupBy = ref<'stage' | 'ambiente' | 'regiao'>('stage')
const page = ref(1)

// filtros
const q = ref('')
const ambFilter = ref('todos')
const stageSel = ref<string[]>([])
const regiaoSel = ref<string[]>([])
const tempSel = ref<string[]>([])

function toggleArr(arr: string[], v: string) {
  const i = arr.indexOf(v)
  if (i >= 0) arr.splice(i, 1); else arr.push(v)
}
function clearFilters() {
  q.value = ''; ambFilter.value = 'todos'; stageSel.value = []; regiaoSel.value = []; tempSel.value = []
}
const activeCount = computed(() =>
  (q.value ? 1 : 0) + (ambFilter.value !== 'todos' ? 1 : 0) +
  stageSel.value.length + regiaoSel.value.length + tempSel.value.length
)

// filtragem (vale nos 2 modos). Busca com debounce: o quadro não re-renderiza a cada tecla.
const qd = useDebouncedRef(q)
const filtered = computed(() => {
  const term = qd.value.trim().toLowerCase()
  let r = leads.value.filter((l) => {
    if (ambFilter.value !== 'todos' && l.ambiente !== ambFilter.value) return false
    if (stageSel.value.length && !stageSel.value.includes(l.stage)) return false
    if (regiaoSel.value.length && !regiaoSel.value.includes(l.regiao)) return false
    if (tempSel.value.length && !tempSel.value.includes(l.temp)) return false
    if (term && !(`${l.company} ${l.contact?.name || ''}`.toLowerCase().includes(term))) return false
    return true
  })
  if (sort.value === 'value') r = [...r].sort((a, b) => b.value - a.value)
  else if (sort.value === 'company') r = [...r].sort((a, b) => a.company.localeCompare(b.company, 'pt-BR'))
  else r = [...r].sort((a, b) => (b.created || '').localeCompare(a.created || ''))
  return r
})

// QUADRO usa o conjunto filtrado (ordenação não importa nas colunas)
const columns = computed(() => {
  if (groupBy.value === 'ambiente') return ambientes.value.map((a) => ({ id: a.id, name: a.name, chip: [a.color + '1A', a.color] }))
  if (groupBy.value === 'regiao') return REGIOES.filter((r) => filtered.value.some((l) => l.regiao === r)).map((r) => ({ id: r, name: r, chip: REGIAO_CHIP[r] || ['#F4F5F7', '#52525B'] }))
  return stages.value.map((s) => ({ id: s.id, name: s.name, chip: stageChip(s.id) }))
})
const keyOf = (l: any) => groupBy.value === 'ambiente' ? l.ambiente : groupBy.value === 'regiao' ? l.regiao : l.stage
// Agrupa UMA vez por render (Map) em vez de refiltrar o array inteiro por coluna.
// Importa para escalar: com 1000+ leads, evita N×colunas varreduras a cada mudança.
const grouped = computed(() => {
  const m = new Map<string, any[]>()
  for (const l of filtered.value) {
    const k = keyOf(l)
    const arr = m.get(k)
    if (arr) arr.push(l)
    else m.set(k, [l])
  }
  return m
})
const colLeads = (id: string) => grouped.value.get(id) || []
const colSum = (id: string) => colLeads(id).reduce((a, l) => a + l.value, 0)

// LISTA paginada
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const paged = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
watch([filtered, view], () => { if (page.value > totalPages.value) page.value = 1 })

const open = computed(() => filtered.value.filter((l) => l.stage !== 'perdido'))
const totalValue = computed(() => open.value.reduce((a, l) => a + l.value, 0))

function setSort(s: 'value' | 'company') { sort.value = s }

function onDragStart(lead: any) { drag.value = lead.id }
function onDragEnd() { drag.value = null; over.value = null }
function onLeave(e: DragEvent, id: string) { if (e.currentTarget === e.target && over.value === id) over.value = null }
function onDrop(colId: string) {
  if (!drag.value) return
  const field = groupBy.value === 'ambiente' ? 'ambiente' : groupBy.value === 'regiao' ? 'regiao' : 'stage'
  updateLead(drag.value, { [field]: colId })
  drag.value = null; over.value = null
}
function openLead(id: string) { navigateTo(`/pipeline/${id}`) }
</script>

<style scoped>
.kcol-plus { display: grid; place-items: center; width: 24px; height: 24px; border: 1px solid var(--line); border-radius: var(--r-sm); background: var(--surface); color: var(--ink-3); cursor: pointer }
.kcol-plus:hover { border-color: var(--brand); color: var(--brand-700); background: var(--brand-soft) }
.pp-list th.pp-sortable { cursor: pointer; user-select: none; white-space: nowrap }
.pp-list th.pp-sortable:hover { color: var(--brand-700) }
.pp-list .ta-r { text-align: right }
.pp-temp { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; text-transform: capitalize }
.pp-tdot { width: 8px; height: 8px; border-radius: 50%; display: inline-block }
.pp-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 14px; flex-wrap: wrap }
.pp-foot .btn:disabled { opacity: .45; cursor: not-allowed }
</style>
