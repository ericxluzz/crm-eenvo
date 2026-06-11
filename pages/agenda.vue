<template>
  <div class="screen content-pad" style="max-width:none">
    <div class="page-head">
      <div class="pt"><h1>Agenda</h1><p class="sub">Reflexo (somente leitura) do seu Google Agenda</p></div>
      <div class="acts">
        <span class="gsync">
          <GoogleG :size="16" /> Google Agenda
          <template v-if="connected"><span class="live" /> Sincronizado</template>
          <template v-else><span style="color:var(--ink-3)">· não conectado</span></template>
        </span>
        <a v-if="!connected" href="/api/google/conectar" class="btn btn-primary"><GoogleG :size="16" /> Conectar Google</a>
      </div>
    </div>

    <div v-if="!connected" class="card card-pad" style="margin-bottom:18px;display:flex;align-items:center;gap:12px">
      <span class="ic" style="width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:var(--info-bg);color:var(--info);flex:0 0 38px"><Icon name="calendar" :size="19" /></span>
      <div class="grow">
        <div class="cell-strong">Mostrando uma semana de exemplo</div>
        <div class="muted" style="font-size:13px">Conecte sua Agenda Google para ver seus compromissos reais aqui (somente leitura).</div>
      </div>
      <a href="/api/google/conectar" class="btn btn-secondary btn-sm"><GoogleG :size="15" /> Conectar</a>
    </div>

    <div class="gcal card">
      <div class="gcal-toolbar">
        <button class="btn btn-secondary btn-sm">Hoje</button>
        <div class="gcal-nav">
          <button class="icon-btn" style="width:34px;height:34px"><Icon name="chevron-left" :size="17" /></button>
          <button class="icon-btn" style="width:34px;height:34px"><Icon name="chevron-right" :size="17" /></button>
        </div>
        <div class="gcal-title">{{ rangeTitle }}</div>
        <div style="margin-left:auto" class="flex aic gap12">
          <div class="segmented sm">
            <button v-for="v in ['Dia', 'Semana', 'Mês']" :key="v" :class="{ on: v === 'Semana' }">{{ v }}</button>
          </div>
        </div>
      </div>

      <div class="gcal-body">
        <aside class="gcal-rail">
          <div class="mini-month">
            <div class="mm-head"><span class="mm-title">{{ mmTitle }}</span>
              <span class="flex gap8"><button class="mm-arrow"><Icon name="chevron-left" :size="15" /></button><button class="mm-arrow"><Icon name="chevron-right" :size="15" /></button></span>
            </div>
            <div class="mini-grid">
              <div v-for="(d, i) in dow" :key="'h' + i" class="dow">{{ d }}</div>
              <div v-for="(c, i) in mmCells" :key="i" class="d" :class="{ dim: !c, today: c === todayDate }">{{ c || '' }}</div>
            </div>
          </div>
          <div class="cal-list">
            <h6>Minhas agendas</h6>
            <label v-for="(c, i) in cals" :key="i" class="cal-chk" @click="c.on = !c.on">
              <span class="box" :style="{ background: c.on ? c.color : 'transparent', border: c.on ? 'none' : '2px solid ' + c.color }"><Icon v-if="c.on" name="check" :size="11" /></span>
              {{ c.name }}
            </label>
          </div>
        </aside>

        <div class="gcal-main">
          <div class="gcal-head">
            <div class="gutter-cell" />
            <div v-for="(d, i) in days" :key="i" class="gcal-dayhead" :class="{ today: i === todayIdx }">
              <div class="dn">{{ d.label }}</div><div class="dd">{{ d.date }}</div>
              <div v-if="allDayByDay[i]" class="allday-chip" :title="allDayByDay[i].join(' · ')">{{ allDayByDay[i][0] }}<span v-if="allDayByDay[i].length > 1"> +{{ allDayByDay[i].length - 1 }}</span></div>
            </div>
          </div>
          <div class="gcal-scroll">
            <div class="gcal-grid" :style="{ height: hours.length * ROW + 'px' }">
              <div class="gcal-gutter">
                <div v-for="h in hours" :key="h" class="gcal-hr" :style="{ height: ROW + 'px' }"><span class="lbl">{{ h }}:00</span></div>
              </div>
              <div v-for="(d, di) in days" :key="di" class="gcal-col">
                <div v-for="h in hours" :key="h" class="cell" :style="{ height: ROW + 'px' }" />
              </div>
              <div v-if="todayIdx >= 0" class="now-line" :style="{ top: nowTop + 'px', left: `calc(60px + ${todayIdx} * ((100% - 60px)/7))`, width: 'calc((100% - 60px)/7)' }" />
              <div class="gcal-events">
                <div
                  v-for="(b, i) in blocks" :key="i" class="gev"
                  :style="{ background: b.color, top: b.top + 'px', height: b.height + 'px', left: `calc(60px + ${b.day} * ((100% - 60px)/7) + 3px)`, width: 'calc((100% - 60px)/7 - 6px)' }"
                >
                  <div class="gt truncate">{{ b.title }}</div>
                  <div class="gtime">{{ b.timeLabel }}{{ b.loc ? ' · ' + b.loc : '' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EVENTS } from '~/utils/protoData'

const GCOLOR: Record<string, string> = { meet: '#039BE5', call: '#0B8043', internal: '#8E24AA', task: '#F4511E' }
const REAL_COLOR = '#039BE5'
const dow = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
const START = 7, END = 20, ROW = 48
const hours = Array.from({ length: END - START }, (_, i) => START + i)
const cals = ref([
  { name: 'eenvo · Comercial', color: '#039BE5', on: true },
  { name: 'Reuniões (Meet)', color: '#8E24AA', on: true },
  { name: 'Tarefas', color: '#F4511E', on: true }
])

// ---- Semana atual (segunda a domingo) ----
function startOfWeek(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const wd = (x.getDay() + 6) % 7 // 0 = segunda
  x.setDate(x.getDate() - wd)
  return x
}
const now = new Date()
const monday = startOfWeek(now)
const weekEnd = new Date(monday); weekEnd.setDate(monday.getDate() + 7)
const labels = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']
const days = Array.from({ length: 7 }, (_, i) => {
  const dt = new Date(monday); dt.setDate(monday.getDate() + i)
  return { label: labels[i], date: dt.getDate() }
})
const monthFmt = monday.toLocaleDateString('pt-BR', { month: 'long' })
const rangeTitle = `${monday.getDate()} – ${new Date(weekEnd.getTime() - 1).getDate()} de ${monthFmt} de ${monday.getFullYear()}`

function dayIndexOf(d: Date) { return Math.floor((new Date(d).setHours(0, 0, 0, 0) - monday.getTime()) / 86400000) }
const todayIdx = dayIndexOf(now)
const nowTop = (now.getHours() + now.getMinutes() / 60 - START) * ROW

// ---- Mini-mês do mês atual ----
const mmTitle = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
const todayDate = now.getDate()
const mmCells = (() => {
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const lead = (first.getDay() + 6) % 7
  const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= dim; d++) cells.push(d)
  return cells
})()

// ---- Eventos (Google real ou exemplo) ----
const { data } = await useAsyncData('gcal', () =>
  $fetch<{ conectado: boolean; eventos: any[] }>('/api/google/eventos', {
    query: { timeMin: monday.toISOString(), timeMax: weekEnd.toISOString() }
  }).catch(() => ({ conectado: false, eventos: [] }))
)
const connected = computed(() => data.value?.conectado ?? false)

function hm(x: number) { const h = Math.floor(x); const m = Math.round((x - h) * 60); return h + (m ? ':' + String(m).padStart(2, '0') : '') }

const blocks = computed(() => {
  const out: any[] = []
  if (connected.value) {
    for (const e of data.value?.eventos ?? []) {
      if (e.allDay || !e.start) continue
      const s = new Date(e.start)
      const en = e.end ? new Date(e.end) : new Date(s.getTime() + 3600000)
      const di = dayIndexOf(s)
      if (di < 0 || di > 6) continue
      let sh = s.getHours() + s.getMinutes() / 60
      let eh = en.toDateString() !== s.toDateString() ? END : en.getHours() + en.getMinutes() / 60
      if (sh < START) sh = START
      if (eh <= sh) eh = sh + 0.5
      out.push({ day: di, top: (sh - START) * ROW, height: Math.max((eh - sh) * ROW - 3, 18), title: e.title, loc: e.location, color: REAL_COLOR, timeLabel: hm(sh) + '–' + hm(eh) })
    }
  } else {
    for (const e of EVENTS) {
      out.push({ day: e.day, top: (e.start - START) * ROW, height: Math.max((e.end - e.start) * ROW - 3, 18), title: e.title, loc: (e as any).loc || '', color: GCOLOR[e.type] || GCOLOR.call, timeLabel: hm(e.start) + '–' + hm(e.end) })
    }
  }
  return out
})

const allDayByDay = computed(() => {
  const map: Record<number, string[]> = {}
  if (connected.value) {
    for (const e of data.value?.eventos ?? []) {
      if (!e.allDay || !e.start) continue
      const di = dayIndexOf(new Date(e.start + 'T00:00:00'))
      if (di < 0 || di > 6) continue
      ;(map[di] = map[di] || []).push(e.title)
    }
  }
  return map
})
</script>

<style scoped>
.allday-chip { margin-top: 4px; font-size: 10.5px; font-weight: 600; color: #fff; background: #0B8043; border-radius: 5px; padding: 1px 6px; max-width: 90%; margin-inline: auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
