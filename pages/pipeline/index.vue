<template>
  <div class="screen content-pad" style="max-width:none">
    <div class="page-head">
      <div class="pt">
        <h1>Pipeline comercial</h1>
        <p class="sub">{{ open.length }} negócios abertos · {{ fmtBRL(totalValue) }} em MRR potencial</p>
      </div>
      <div class="acts">
        <div class="segmented">
          <button :class="{ on: view === 'board' }" @click="view = 'board'"><Icon name="kanban" :size="15" /> Quadro</button>
          <button :class="{ on: view === 'list' }" @click="view = 'list'"><Icon name="list" :size="15" /> Lista</button>
        </div>
        <button class="btn btn-primary" @click="openNewLead"><Icon name="plus" :size="17" /> Novo lead</button>
      </div>
    </div>

    <div class="flex aic gap8" style="margin-bottom:18px;flex-wrap:wrap">
      <button class="chip" :class="{ active: ambFilter === 'todos' }" @click="ambFilter = 'todos'">Todos os ambientes</button>
      <button
        v-for="a in ambientes" :key="a.id" class="chip" :class="{ active: ambFilter === a.id }" @click="ambFilter = a.id"
      >
        <Icon :name="a.icon" :size="14" :style="{ color: ambFilter === a.id ? 'var(--brand-700)' : a.color }" />{{ a.short }}
      </button>
      <div v-if="view === 'board'" class="flex aic gap8" style="margin-left:auto">
        <span class="muted" style="font-size:12.5px">Agrupar por</span>
        <div class="segmented sm">
          <button v-for="g in groups" :key="g.k" :class="{ on: groupBy === g.k }" @click="groupBy = g.k">{{ g.l }}</button>
        </div>
      </div>
    </div>

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
            <span class="sum">{{ colSum(col.id) ? fmtBRL(colSum(col.id)) : '' }}</span>
          </div>
          <div class="kcol-body">
            <KCard
              v-for="l in colLeads(col.id)" :key="l.id" :lead="l" :dragging="drag === l.id"
              @open="openLead" @dragstart="onDragStart" @dragend="onDragEnd"
            />
            <div v-if="colLeads(col.id).length === 0" style="font-size:12.5px;color:var(--ink-3);text-align:center;padding:18px 0">Vazio</div>
          </div>
          <div class="kcol-add"><button><Icon name="plus" :size="15" /> Adicionar</button></div>
        </div>
      </div>
    </div>

    <div v-else class="card">
      <div style="overflow-x:auto">
        <table class="tbl">
          <thead><tr><th>Empresa</th><th>Estágio</th><th>Ambiente</th><th>Região</th><th>MRR</th><th>Próxima ação</th><th>Contato</th><th style="width:40px" /></tr></thead>
          <tbody>
            <tr v-for="l in shown" :key="l.id" @click="openLead(l.id)">
              <td><div class="flex aic" style="gap:11px"><CompanyLogo :lead="l" /><div><div class="cell-strong">{{ l.company }}</div><div class="cell-mute" style="font-size:12px">{{ l.seg }}</div></div></div></td>
              <td><StageBadge :stage="l.stage" /></td>
              <td><AmbienteTag :id="l.ambiente" size="sm" /></td>
              <td><span style="font-size:13px">{{ l.estado }} · {{ l.regiao }}</span></td>
              <td class="cell-strong" style="font-family:var(--font-mono)">{{ fmtBRL(l.value) }}</td>
              <td><span class="cell-mute" style="font-size:13px">{{ l.next && l.next.label !== '—' ? l.next.label : '—' }}</span></td>
              <td><div class="flex aic gap8"><EAvatar :name="l.contact.name" :photo="l.contact.photo" :size="26" /><span style="font-size:13px">{{ l.contact.name.split(' ')[0] }}</span></div></td>
              <td><Icon name="chevron-right" :size="16" style="color:var(--ink-3)" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { STAGES, fmtBRL } from '~/utils/protoData'

const STAGE_CHIP: Record<string, string[]> = {
  mapeado: ['#F1F2F4', '#52525B'], contatado: ['#EFF4FF', '#2563EB'], reuniao: ['#F3EAFB', '#7A2FAE'],
  apresentado: ['#ECFEFF', '#0E7490'], proposta: ['#FFF6EC', '#B45309'], perdido: ['#FEF2F2', '#DC2626']
}
const REGIAO_CHIP: Record<string, string[]> = {
  Sudeste: ['#F3EAFB', '#7A2FAE'], Sul: ['#EFF4FF', '#2563EB'],
  Nordeste: ['#FFF6EC', '#B45309'], 'Centro-Oeste': ['#ECFDF3', '#16A34A'], Norte: ['#ECFEFF', '#0E7490']
}
const groups: { k: 'stage' | 'ambiente' | 'regiao'; l: string }[] = [{ k: 'stage', l: 'Estágio' }, { k: 'ambiente', l: 'Ambiente' }, { k: 'regiao', l: 'Região' }]

const { openNewLead } = useOverlays()
const { leads, ambientes, updateLead } = useCrm()
const drag = ref<string | null>(null)
const over = ref<string | null>(null)
const ambFilter = ref('todos')
const view = ref<'board' | 'list'>('board')
const groupBy = ref<'stage' | 'ambiente' | 'regiao'>('stage')

const shown = computed(() => ambFilter.value === 'todos' ? leads.value : leads.value.filter((l) => l.ambiente === ambFilter.value))

const columns = computed(() => {
  if (groupBy.value === 'ambiente') return ambientes.value.map((a) => ({ id: a.id, name: a.name, chip: [a.color + '1A', a.color] }))
  if (groupBy.value === 'regiao') {
    const order = ['Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste', 'Norte']
    return order.filter((r) => shown.value.some((l) => l.regiao === r)).map((r) => ({ id: r, name: r, chip: REGIAO_CHIP[r] || ['#F4F5F7', '#52525B'] }))
  }
  return STAGES.map((s) => ({ id: s.id, name: s.name, chip: STAGE_CHIP[s.id] }))
})
const keyOf = (l: any) => groupBy.value === 'ambiente' ? l.ambiente : groupBy.value === 'regiao' ? l.regiao : l.stage
const colLeads = (id: string) => shown.value.filter((l) => keyOf(l) === id)
const colSum = (id: string) => colLeads(id).reduce((a, l) => a + l.value, 0)

const open = computed(() => shown.value.filter((l) => l.stage !== 'perdido'))
const totalValue = computed(() => open.value.reduce((a, l) => a + l.value, 0))

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
