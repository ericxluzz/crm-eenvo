<template>
  <div class="screen content-pad">
    <div class="page-head">
      <div class="pt"><h1>Visão geral</h1><p class="sub">Olá, {{ primeiroNome }}. Panorama da captação e do funil da eenvo.</p></div>
      <div class="acts">
        <label class="period-wrap">
          <Icon name="calendar" :size="16" />
          <select v-model="periodo" class="period-sel">
            <option value="all">Todo o período</option>
            <option value="2026-06">Junho 2026</option>
            <option value="2026-05">Maio 2026</option>
            <option value="2026-04">Abril 2026</option>
          </select>
        </label>
        <button class="btn btn-secondary" @click="exportar"><Icon name="download" :size="16" /> Exportar</button>
      </div>
    </div>

    <div class="stat-grid" style="margin-bottom:18px">
      <StatCard icon="coin" icon-bg="#F3EAFB" icon-fg="#7A2FAE" label="MRR no pipeline" :value="fmtBRL(mrr)" :delta="12" foot="vs. mês anterior" :spark="[22,24,23,26,27,30,32]" />
      <StatCard icon="kanban" icon-bg="#EFF4FF" icon-fg="#2563EB" label="Negócios abertos" :value="open.length" :delta="8" foot="3 entraram esta semana" :spark="[9,10,11,11,12,14,15]" />
      <StatCard icon="package" icon-bg="#FFF6EC" icon-fg="#B45309" label="Ticket médio" :value="fmtBRL(Math.round(mrr / open.length))" :delta="-4" foot="MRR por negócio" :spark="[24,23,24,22,23,21,21]" />
      <StatCard icon="target" icon-bg="#ECFDF3" icon-fg="#16A34A" label="Taxa de conversão" value="24%" :delta="3" foot="lead → cliente" :spark="[18,19,20,21,22,23,24]" />
    </div>

    <div style="display:grid;grid-template-columns:1.55fr 1fr;gap:18px;margin-bottom:18px">
      <div class="card card-pad">
        <div class="flex aic jcb" style="margin-bottom:18px">
          <div><h3 style="margin:0;font-size:16px;font-weight:600">Funil de vendas</h3><p style="margin:3px 0 0;font-size:13px;color:var(--ink-3)">Negócios por estágio</p></div>
          <button class="chip" @click="navigateTo('/pipeline')">Ver pipeline <Icon name="arrow-right" :size="14" /></button>
        </div>
        <div class="funnel">
          <div v-for="f in funnel" :key="f.id" class="fr">
            <div class="fl"><span class="sw" :style="{ background: f.color }" />{{ f.name }}</div>
            <div class="track"><i :style="{ width: Math.max((f.count / maxF) * 100, 6) + '%', background: f.color, opacity: .9 }" /></div>
            <div class="num">{{ f.count }} · {{ f.val ? fmtBRL(f.val) : 'R$ 0' }}</div>
          </div>
        </div>
      </div>
      <div class="card card-pad">
        <h3 style="margin:0 0 4px;font-size:16px;font-weight:600">Ambiente de captação</h3>
        <p style="margin:0 0 16px;font-size:13px;color:var(--ink-3)">De onde os leads chegaram</p>
        <div class="flex aic gap16">
          <Donut :segments="ambSeg" />
          <div class="leglist grow">
            <div v-for="s in ambSeg" :key="s.id" class="lr"><span class="sw" :style="{ background: s.c }" />{{ s.l }}<span class="v" style="font-family:var(--font-mono)">{{ s.v }}</span></div>
          </div>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1.55fr 1fr;gap:18px">
      <div class="card card-pad">
        <div class="flex aic jcb" style="margin-bottom:8px">
          <div><h3 style="margin:0;font-size:16px;font-weight:600">Evolução do MRR fechado</h3><p style="margin:3px 0 0;font-size:13px;color:var(--ink-3)">Últimos 7 meses (em milhares)</p></div>
          <span class="badge badge-pos"><Icon name="trending" :size="13" /> +18% no semestre</span>
        </div>
        <AreaChart :data="[{l:'Dez',v:18},{l:'Jan',v:21},{l:'Fev',v:19},{l:'Mar',v:26},{l:'Abr',v:24},{l:'Mai',v:31},{l:'Jun',v:34}]" />
      </div>
      <div class="card">
        <div class="card-pad" style="padding-bottom:8px">
          <div class="flex aic jcb"><h3 style="margin:0;font-size:16px;font-weight:600">Próximas ações</h3><button class="chip" @click="navigateTo('/agenda')">Ver agenda</button></div>
        </div>
        <div>
          <div v-for="l in today" :key="l.id" class="act-row" style="cursor:pointer" @click="navigateTo('/pipeline')">
            <EAvatar :name="l.contact.name" :photo="l.contact.photo" :size="32" />
            <div class="grow" style="min-width:0"><div class="at truncate" style="font-size:13.5px">{{ l.next.label }}</div><div class="asub truncate">{{ l.company }} · {{ l.next.due ? 'Hoje' : fmtDate(l.next.date) }}</div></div>
            <span v-if="l.next.due" class="badge badge-warn" style="height:22px">Hoje</span>
            <AmbienteTag v-else :id="l.ambiente" size="sm" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { STAGES, fmtBRL } from '~/utils/protoData'

const { leads, ambientes, ambById } = useCrm()
const { nome } = useMe()
const primeiroNome = computed(() => (nome.value || '').split(' ')[0] || 'lá')

const periodo = ref('all')
const baseLeads = computed(() => periodo.value === 'all'
  ? leads.value
  : leads.value.filter((l) => (l.created || '').startsWith(periodo.value)))

const open = computed(() => baseLeads.value.filter((l) => l.stage !== 'perdido'))
const mrr = computed(() => open.value.reduce((a, l) => a + l.value, 0))

const funnel = computed(() => STAGES.filter((s) => s.id !== 'perdido').map((s) => ({
  ...s,
  count: baseLeads.value.filter((l) => l.stage === s.id).length,
  val: baseLeads.value.filter((l) => l.stage === s.id).reduce((a, l) => a + l.value, 0)
})))
const maxF = computed(() => Math.max(1, ...funnel.value.map((f) => f.count)))

const ambSeg = computed(() => ambientes.value.map((a) => ({ id: a.id, l: a.short, v: baseLeads.value.filter((l) => l.ambiente === a.id).length, c: a.color })))
const today = computed(() => baseLeads.value.filter((l) => l.next && l.next.label !== '—').slice(0, 5))

function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('pt-BR') : '' }

function exportar() {
  const stageName = (id: string) => STAGES.find((s) => s.id === id)?.name ?? id
  const head = ['ID', 'Empresa', 'Segmento', 'Estágio', 'MRR (R$/mês)', 'Ambiente', 'Estado', 'Região', 'Criado em']
  const rows = baseLeads.value.map((l) => [l.id, l.company, l.seg, stageName(l.stage), l.value, ambById(l.ambiente)?.short ?? l.ambiente, l.estado, l.regiao, l.created])
  const esc = (c: any) => `"${String(c ?? '').replace(/"/g, '""')}"`
  const csv = [head, ...rows].map((r) => r.map(esc).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `eenvo-visao-geral-${periodo.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.period-wrap { display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 12px; border: 1px solid var(--line-strong); border-radius: var(--r-sm); background: #fff; color: var(--ink-2); cursor: pointer; }
.period-sel { border: 0; background: transparent; font-family: var(--font); font-size: 14px; font-weight: 600; color: var(--ink); cursor: pointer; outline: none; }
</style>
