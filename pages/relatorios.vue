<template>
  <div class="screen content-pad">
    <div class="page-head">
      <div class="pt"><h1>Relatórios</h1><p class="sub">Captação por ambiente e região · Junho 2026</p></div>
      <div class="acts">
        <button class="btn btn-secondary"><Icon name="calendar" :size="16" /> Este mês</button>
        <button class="btn btn-primary"><Icon name="download" :size="16" /> Exportar PDF</button>
      </div>
    </div>

    <div class="stat-grid" style="margin-bottom:18px">
      <StatCard icon="users" icon-bg="#F3EAFB" icon-fg="#7A2FAE" label="Leads captados" :value="totalLeads" :delta="15" foot="no mês" :spark="[10,11,12,13,14,15,16]" />
      <StatCard icon="sparkles" icon-bg="#F3EAFB" icon-fg="#8E3FC4" label="Via Projeto Centelha" :value="centelhaLeads" :delta="20" foot="multi-estado" :spark="[2,3,3,4,5,5,6]" />
      <StatCard icon="users" icon-bg="#ECFDF3" icon-fg="#16A34A" label="Via indicação" :value="indicacaoLeads" :delta="9" foot="indicados por clientes" :spark="[1,2,2,3,3,4,4]" />
      <StatCard icon="clock" icon-bg="#FFF6EC" icon-fg="#B45309" label="Ciclo médio" value="38 dias" :delta="-6" foot="mapeado → fechado" :spark="[44,42,41,40,39,38,38]" />
    </div>

    <div class="card" style="margin-bottom:18px">
      <div class="card-pad" style="padding-bottom:6px"><h3 style="margin:0;font-size:16px;font-weight:600">Desempenho por ambiente</h3><p style="margin:3px 0 0;font-size:13px;color:var(--ink-3)">Volume e MRR potencial por origem de captação</p></div>
      <table class="tbl">
        <thead><tr><th style="width:40px">#</th><th>Ambiente</th><th>Leads</th><th>% do total</th><th style="width:34%">MRR potencial</th></tr></thead>
        <tbody>
          <tr v-for="(r, i) in ambPerf" :key="r.a.id">
            <td class="cell-strong">{{ i + 1 }}</td>
            <td><div class="flex aic gap8"><span class="amb-tag" :style="{ background: r.a.color + '1A', color: r.a.color }"><Icon :name="r.a.icon" :size="13" />{{ r.a.short }}</span></div></td>
            <td class="cell-strong" style="font-family:var(--font-mono)">{{ r.leads }}</td>
            <td>{{ Math.round((r.leads / totalLeads) * 100) }}%</td>
            <td><div class="flex aic gap12"><div class="prog grow"><i :style="{ width: (r.mrr / maxMrr) * 100 + '%', background: r.a.color }" /></div><span class="cell-strong" style="width:96px;text-align:right;font-family:var(--font-mono)">{{ fmtBRL(r.mrr) }}</span></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
      <div class="card card-pad">
        <h3 style="margin:0 0 4px;font-size:16px;font-weight:600">Leads por região</h3>
        <p style="margin:0 0 18px;font-size:13px;color:var(--ink-3)">Distribuição geográfica da captação</p>
        <div class="funnel">
          <div v-for="r in regData" :key="r.l" class="fr"><div class="fl"><span class="sw" :style="{ background: regColor[r.l] }" />{{ r.l }}</div><div class="track"><i :style="{ width: (r.v / maxReg) * 100 + '%', background: regColor[r.l] }" /></div><div class="num">{{ r.v }} leads</div></div>
        </div>
      </div>
      <div class="card card-pad">
        <h3 style="margin:0 0 4px;font-size:16px;font-weight:600">Motivos de perda</h3>
        <p style="margin:0 0 18px;font-size:13px;color:var(--ink-3)">Negócios perdidos no trimestre</p>
        <div class="funnel">
          <div v-for="s in motivos" :key="s.l" class="fr"><div class="fl">{{ s.l }}</div><div class="track"><i :style="{ width: s.v + '%', background: s.c }" /></div><div class="num">{{ s.v }}%</div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fmtBRL } from '~/utils/protoData'

const { leads, ambientes } = useCrm()

const totalLeads = computed(() => leads.value.length)
const ambPerf = computed(() => ambientes.value.map((a) => {
  const ls = leads.value.filter((l) => l.ambiente === a.id)
  return { a, leads: ls.length, mrr: ls.filter((l) => l.stage !== 'perdido').reduce((s, l) => s + l.value, 0) }
}).sort((x, y) => y.mrr - x.mrr))
const maxMrr = computed(() => Math.max(...ambPerf.value.map((r) => r.mrr)))
const centelhaLeads = computed(() => ambPerf.value.find((r) => r.a.id === 'centelha')?.leads ?? 0)
const indicacaoLeads = computed(() => ambPerf.value.find((r) => r.a.id === 'indicacao')?.leads ?? 0)

const regColor: Record<string, string> = { Sudeste: '#8E3FC4', Sul: '#2563EB', Nordeste: '#D97706', 'Centro-Oeste': '#16A34A' }
const regData = computed(() => ['Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste'].map((r) => ({ l: r, v: leads.value.filter((l) => l.regiao === r).length })).filter((r) => r.v > 0))
const maxReg = computed(() => Math.max(...regData.value.map((r) => r.v)))
const motivos = [{ l: 'Preço', v: 42, c: '#DC2626' }, { l: 'Optou por concorrente', v: 28, c: '#D97706' }, { l: 'Sem orçamento', v: 18, c: '#8A8F99' }, { l: 'Sem resposta', v: 12, c: '#C9B6E0' }]
</script>
