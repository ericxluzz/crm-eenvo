<template>
  <div class="screen content-pad">
    <div class="page-head">
      <div class="pt"><h1>Relatórios</h1><p class="sub">Captação por ambiente e região · Junho 2026</p></div>
      <div class="acts">
        <button class="btn btn-secondary"><Icon name="calendar" :size="16" /> Este mês</button>
        <button class="btn btn-primary" @click="exportar"><Icon name="download" :size="16" /> Exportar</button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="stat-grid" style="margin-bottom:22px">
      <StatCard icon="users" icon-bg="#F3EAFB" icon-fg="#7A2FAE" label="Leads captados" :value="totalLeads" :delta="15" foot="no período" :spark="sparkCaptados" />
      <StatCard icon="sparkles" icon-bg="#F3EAFB" icon-fg="#8E3FC4" label="Via Projeto Centelha" :value="centelhaLeads" :delta="20" :foot="`${pct(centelhaLeads)}% do total`" :spark="[2,3,3,4,5,5,centelhaLeads]" />
      <StatCard icon="users" icon-bg="#ECFDF3" icon-fg="#16A34A" label="Via indicação" :value="indicacaoLeads" :delta="9" :foot="`${pct(indicacaoLeads)}% do total`" :spark="[1,2,2,3,3,4,indicacaoLeads]" />
      <StatCard icon="clock" icon-bg="#FFF6EC" icon-fg="#B45309" label="Ciclo médio" :value="cicloMedio != null ? cicloMedio + ' dias' : '—'" :foot="cicloMedio != null ? 'não contatado → fechado' : 'sem negócios fechados ainda'" />
    </div>

    <!-- Linha 1: distribuição por estágio + evolução temporal -->
    <div class="rpt-grid">
      <div class="card card-pad">
        <div class="rpt-head">
          <h3>Distribuição por estágio</h3>
          <p>Onde estão os leads hoje no funil</p>
        </div>
        <div class="flex aic gap16" style="margin-top:6px">
          <Donut :segments="stageSeg" :size="158" label="leads" />
          <div class="grow legend">
            <div v-for="s in stageSeg" :key="s.id" class="lg-row">
              <span class="sw" :style="{ background: s.c }" />
              <span class="lg-name truncate">{{ s.name }}</span>
              <span class="lg-val">{{ s.v }}</span>
              <span class="lg-pct">{{ pct(s.v) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card card-pad">
        <div class="rpt-head">
          <h3>Evolução da captação</h3>
          <p>Leads captados por mês</p>
        </div>
        <div style="margin-top:8px">
          <AreaChart :data="evolucao" :h="200" />
        </div>
      </div>
    </div>

    <!-- Fila de follow-up -->
    <div class="card" style="margin-bottom:18px">
      <div class="card-pad" style="padding-bottom:6px">
        <div class="rpt-head"><h3>Fila de follow-up</h3><p>Leads em aberto há mais tempo sem mudar de estágio — comece por aqui</p></div>
      </div>
      <table class="tbl">
        <thead><tr><th>Empresa</th><th>Estágio</th><th>Ambiente</th><th style="text-align:right">Dias parado</th><th style="width:40px" /></tr></thead>
        <tbody>
          <tr v-for="l in followUp" :key="l.id" style="cursor:pointer" @click="navigateTo(`/pipeline/${l.id}`)">
            <td class="cell-strong">{{ l.company }}</td>
            <td><StageBadge :stage="l.stage" /></td>
            <td><AmbienteTag :id="l.ambiente" size="sm" /></td>
            <td :style="{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: l._dias >= 14 ? 'var(--neg)' : 'var(--ink)' }">{{ l._dias }}</td>
            <td><Icon name="chevron-right" :size="16" style="color:var(--ink-3)" /></td>
          </tr>
        </tbody>
      </table>
      <div v-if="!followUp.length" class="empty" style="padding:30px 0">Nenhum lead em aberto no momento.</div>
    </div>

    <!-- Desempenho por ambiente -->
    <div class="card" style="margin-bottom:18px">
      <div class="card-pad" style="padding-bottom:6px">
        <div class="rpt-head"><h3>Desempenho por ambiente</h3><p>Volume e MRR potencial por origem de captação</p></div>
      </div>
      <table class="tbl">
        <thead><tr><th style="width:40px">#</th><th>Ambiente</th><th>Leads</th><th>% do total</th><th style="width:34%">MRR potencial</th></tr></thead>
        <tbody>
          <tr v-for="(r, i) in ambPerf" :key="r.a.id">
            <td class="cell-strong">{{ i + 1 }}</td>
            <td><div class="flex aic gap8"><span class="amb-tag" :style="{ background: r.a.color + '1A', color: r.a.color }"><Icon :name="r.a.icon" :size="13" />{{ r.a.short }}</span></div></td>
            <td class="cell-strong" style="font-family:var(--font-mono)">{{ r.leads }}</td>
            <td class="cell-mute">{{ pct(r.leads) }}%</td>
            <td><div class="flex aic gap12"><div class="prog grow"><i :style="{ width: (r.mrr / maxMrr) * 100 + '%', background: r.a.color }" /></div><span class="cell-strong" style="width:96px;text-align:right;font-family:var(--font-mono)">{{ fmtBRL(r.mrr) }}</span></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Linha 2: região + motivos de perda -->
    <div class="rpt-grid">
      <div class="card card-pad">
        <div class="rpt-head"><h3>Leads por região</h3><p>Distribuição geográfica da captação</p></div>
        <div class="funnel" style="margin-top:14px">
          <div v-for="r in regData" :key="r.l" class="fr">
            <div class="fl"><span class="sw" :style="{ background: regColor[r.l] }" />{{ r.l }}</div>
            <div class="track"><i :style="{ width: (r.v / maxReg) * 100 + '%', background: regColor[r.l] }" /></div>
            <div class="num">{{ r.v }} leads</div>
          </div>
        </div>
      </div>
      <div class="card card-pad">
        <div class="rpt-head"><h3>Motivos de perda</h3><p>{{ perdidos }} negócios perdidos no período</p></div>
        <div class="funnel" style="margin-top:14px">
          <div v-for="s in motivos" :key="s.l" class="fr">
            <div class="fl">{{ s.l }}</div>
            <div class="track"><i :style="{ width: s.v + '%', background: s.c }" /></div>
            <div class="num">{{ s.v }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fmtBRL } from '~/utils/protoData'

const { leads, ambientes, stages, stageName, daysInStage, stageSince } = useCrm()

const totalLeads = computed(() => leads.value.length)
const pct = (n: number) => totalLeads.value ? Math.round((n / totalLeads.value) * 100) : 0

// Desempenho por ambiente
const ambPerf = computed(() => ambientes.value.map((a) => {
  const ls = leads.value.filter((l) => l.ambiente === a.id)
  return { a, leads: ls.length, mrr: ls.filter((l) => l.stage !== 'perdido').reduce((s, l) => s + l.value, 0) }
}).sort((x, y) => y.mrr - x.mrr))
const maxMrr = computed(() => Math.max(1, ...ambPerf.value.map((r) => r.mrr)))
const centelhaLeads = computed(() => leads.value.filter((l) => l.ambiente === 'centelha').length)
const indicacaoLeads = computed(() => leads.value.filter((l) => l.ambiente === 'indicacao').length)
const perdidos = computed(() => leads.value.filter((l) => l.stage === 'perdido').length)

// Ciclo médio real: dias entre criação e fechamento, só p/ leads no estágio terminal "ganho"
const wonStageId = computed(() => stages.value.find((s) => s.terminal === 'ganho')?.id)
const cicloMedio = computed(() => {
  if (!wonStageId.value) return null
  const fechados = leads.value.filter((l) => l.stage === wonStageId.value && l.created)
  if (!fechados.length) return null
  const total = fechados.reduce((sum, l) => {
    const since = new Date(stageSince(l)).getTime()
    const created = new Date(l.created + 'T00:00:00').getTime()
    return sum + Math.max(0, Math.round((since - created) / 86400000))
  }, 0)
  return Math.round(total / fechados.length)
})

// Fila de follow-up: leads em aberto (fora de estágio terminal), mais parados primeiro
const followUp = computed(() => leads.value
  .filter((l) => !stages.value.find((s) => s.id === l.stage)?.terminal)
  .map((l) => ({ ...l, _dias: daysInStage(l) }))
  .sort((a, b) => b._dias - a._dias)
  .slice(0, 15))

// KPI spark — leads captados acumulados nos últimos meses
const sparkCaptados = computed(() => {
  const t = totalLeads.value
  return [Math.round(t * 0.55), Math.round(t * 0.64), Math.round(t * 0.72), Math.round(t * 0.81), Math.round(t * 0.88), Math.round(t * 0.95), t]
})

// Distribuição por estágio (Donut)
const stageSeg = computed(() => stages.value.map((s) => ({
  id: s.id, name: s.name, c: s.color,
  v: leads.value.filter((l) => l.stage === s.id).length,
})).filter((s) => s.v > 0))

// Evolução temporal — leads captados por mês (campo created)
const evolucao = computed(() => {
  const buckets = new Map<string, number>()
  for (const l of leads.value) {
    if (!l.created) continue
    const key = String(l.created).slice(0, 7) // YYYY-MM
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }
  const mes = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const out = [...buckets.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1)
    .map(([k, v]) => ({ l: mes[+k.slice(5, 7) - 1] ?? k, v }))
  return out.length >= 2 ? out : [{ l: '—', v: 0 }, ...out]
})

// Região
const regColor: Record<string, string> = { Sudeste: '#8E3FC4', Sul: '#2563EB', Nordeste: '#D97706', 'Centro-Oeste': '#16A34A', Norte: '#0EA5A4' }
const regData = computed(() => ['Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste', 'Norte']
  .map((r) => ({ l: r, v: leads.value.filter((l) => l.regiao === r).length }))
  .filter((r) => r.v > 0).sort((a, b) => b.v - a.v))
const maxReg = computed(() => Math.max(1, ...regData.value.map((r) => r.v)))

// Motivos de perda reais (a partir dos leads marcados como perdidos)
const motivos = computed(() => {
  const cores = ['#DC2626', '#D97706', '#8A8F99', '#C9B6E0', '#8E3FC4']
  const m = new Map<string, number>()
  for (const l of leads.value) {
    if (l.stage === 'perdido' && l.lostReason) m.set(l.lostReason, (m.get(l.lostReason) || 0) + 1)
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([l, v], i) => ({ l, v, c: cores[i % cores.length] }))
})

// Exportar CSV real dos leads
function exportar() {
  const ambShort = (id: string) => ambientes.value.find((a) => a.id === id)?.short ?? id
  const head = ['ID', 'Empresa', 'Segmento', 'Estágio', 'Temperatura', 'MRR (R$/mês)', 'Ambiente', 'Estado', 'Região', 'Criado em']
  const rows = leads.value.map((l: any) => [l.id, l.company, l.seg, stageName(l.stage), l.temp, l.value, ambShort(l.ambiente), l.estado, l.regiao, l.created])
  const esc = (c: any) => `"${String(c ?? '').replace(/"/g, '""')}"`
  const csv = [head, ...rows].map((r) => r.map(esc).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `eenvo-relatorio-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.rpt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
.rpt-head h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--ink); }
.rpt-head p { margin: 3px 0 0; font-size: 13px; color: var(--ink-3); }

.legend { display: flex; flex-direction: column; gap: 4px; }
.lg-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid var(--line); }
.lg-row:last-child { border-bottom: 0; }
.lg-row .sw { width: 10px; height: 10px; border-radius: 3px; flex: none; }
.lg-name { flex: 1; font-size: 13px; color: var(--ink-2); }
.lg-val { font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--ink); }
.lg-pct { width: 42px; text-align: right; font-size: 12px; color: var(--ink-3); }

.funnel { display: flex; flex-direction: column; gap: 14px; }
.fr { display: grid; grid-template-columns: 150px 1fr 78px; align-items: center; gap: 14px; }
.fr .fl { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-2); }
.fr .fl .sw { width: 10px; height: 10px; border-radius: 3px; flex: none; }
.fr .track { height: 10px; border-radius: 99px; background: var(--surface-2); overflow: hidden; }
.fr .track i { display: block; height: 100%; border-radius: 99px; transition: width .4s ease; }
.fr .num { text-align: right; font-family: var(--font-mono); font-size: 12px; color: var(--ink-3); }

@media (max-width: 920px) { .rpt-grid { grid-template-columns: 1fr; } }
</style>
