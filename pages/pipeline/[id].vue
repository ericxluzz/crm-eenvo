<template>
  <div class="screen content-pad" :data-screen-label="'Lead ' + lead.company">
    <div class="flex aic gap12" style="margin-bottom:18px">
      <NuxtLink to="/pipeline" class="btn btn-secondary btn-sm"><Icon name="chevron-left" :size="15" /> Pipeline</NuxtLink>
      <div class="flex aic gap8 muted" style="font-size:13px">
        <span>Pipeline</span><Icon name="chevron-right" :size="14" /><span style="color:var(--ink);font-weight:500">{{ lead.company }}</span>
      </div>
      <div style="margin-left:auto" class="flex aic gap8">
        <span class="badge badge-gray" style="font-family:var(--font-mono)">{{ lead.id }}</span>
        <button class="icon-btn" title="Mais"><Icon name="more" :size="18" /></button>
      </div>
    </div>

    <div class="lead-grid">
      <!-- LEFT -->
      <div class="flex" style="flex-direction:column;gap:20px">
        <div class="card card-pad">
          <div class="lead-id">
            <CompanyLogo :lead="lead" :size="60" :radius="15" :font-size="23" />
            <div class="grow">
              <h2>{{ lead.company }}</h2>
              <div class="seg"><Icon name="tag" :size="14" style="color:var(--ink-3)" /> {{ lead.seg }}</div>
            </div>
          </div>
          <div class="flex aic gap8" style="margin-top:16px;flex-wrap:wrap">
            <span v-for="(t, i) in lead.tags" :key="i" class="badge" :class="tagClass[t.c]">{{ t.t }}</span>
            <span class="temp" :style="{ color: TEMPC[lead.temp] }"><span class="fl" :style="{ background: TEMPC[lead.temp] }" />{{ tempLabel[lead.temp] }}</span>
          </div>
          <div class="flex gap8" style="margin-top:18px">
            <button class="btn btn-primary grow"><Icon name="mail" :size="16" /> E-mail</button>
            <button class="btn btn-secondary" title="Ligar"><Icon name="phone" :size="16" /></button>
            <button class="btn btn-secondary" title="Agendar"><Icon name="calendar" :size="16" /></button>
          </div>
        </div>

        <div class="card card-pad">
          <h3 class="section-title">Dados da empresa</h3>
          <div class="kv">
            <div class="row"><span class="k"><Icon name="globe" :size="15" />Site</span><span class="v"><a :href="'https://' + lead.site" target="_blank" rel="noreferrer">{{ lead.site }}</a></span></div>
            <div class="row"><span class="k"><Icon name="pin" :size="15" />Localização</span><span class="v">{{ lead.city }}</span></div>
            <div class="row"><span class="k"><Icon name="users" :size="15" />Funcionários</span><span class="v">{{ lead.employees }}</span></div>
            <div class="row"><span class="k"><Icon name="package" :size="15" />Envios/mês</span><span class="v">{{ lead.shipments }}</span></div>
            <div class="row"><span class="k"><Icon name="pin" :size="15" />Região</span><span class="v">{{ lead.estado }} · {{ lead.regiao }}</span></div>
            <div class="row"><span class="k"><Icon name="clock" :size="15" />Criado em</span><span class="v">{{ fmtDate(lead.created) }}</span></div>
          </div>
        </div>

        <div class="card card-pad">
          <h3 class="section-title">Origem do lead</h3>
          <div class="flex aic gap8" style="margin-bottom:14px;flex-wrap:wrap">
            <AmbienteTag :id="lead.ambiente" />
            <span class="uf-pill"><Icon name="pin" :size="11" />{{ lead.estado }} · {{ lead.regiao }}</span>
          </div>
          <div v-if="lead.ambiente === 'centelha'" class="kv">
            <div class="row" style="padding-top:0"><span class="k"><Icon name="sparkles" :size="15" />Programa</span><span class="v">Projeto Centelha</span></div>
            <div class="row"><span class="k"><Icon name="check-circle" :size="15" />Status</span><span class="v">{{ lead.centelhaFase }}</span></div>
          </div>
          <div v-else-if="lead.ambiente === 'evento'" class="kv">
            <div class="row" style="padding-top:0"><span class="k"><Icon name="star" :size="15" />Evento</span><span class="v">{{ lead.eventoNome }}</span></div>
          </div>
          <div v-else-if="lead.ambiente === 'inbound'" class="kv">
            <div class="row" style="padding-top:0"><span class="k"><Icon name="globe" :size="15" />Canal</span><span class="v">Site · busca orgânica</span></div>
          </div>
          <template v-else-if="lead.ambiente === 'indicacao' && lead.indicadoPor">
            <div style="font-size:11px;font-weight:700;letter-spacing:.05em;color:var(--ink-3);margin-bottom:10px">INDICADO POR</div>
            <div class="minirow" style="border-bottom:0;padding:0">
              <EAvatar :name="lead.indicadoPor.name" :photo="lead.indicadoPor.photo" :size="42" />
              <div class="grow"><div class="nm">{{ lead.indicadoPor.name }}</div><div class="rl">{{ lead.indicadoPor.role }}</div></div>
            </div>
            <div class="kv" style="margin-top:6px">
              <div class="row"><span class="k"><Icon name="mail" :size="15" />E-mail</span><span class="v truncate">{{ lead.indicadoPor.email }}</span></div>
              <div class="row"><span class="k"><Icon name="phone" :size="15" />Telefone</span><span class="v">{{ lead.indicadoPor.phone }}</span></div>
            </div>
          </template>
        </div>

        <div class="card card-pad">
          <div class="flex aic jcb" style="margin-bottom:8px">
            <h3 class="section-title" style="margin:0">Contatos</h3>
            <button class="btn btn-ghost btn-sm"><Icon name="plus" :size="15" /> Adicionar</button>
          </div>
          <div class="minirow">
            <EAvatar :name="lead.contact.name" :photo="lead.contact.photo" :size="38" />
            <div class="grow"><div class="nm">{{ lead.contact.name }}</div><div class="rl">{{ lead.contact.role }}</div></div>
            <span class="badge badge-info" style="height:22px">Principal</span>
          </div>
          <div style="margin-top:10px" class="kv">
            <div class="row"><span class="k"><Icon name="mail" :size="15" />E-mail</span><span class="v truncate">{{ lead.contact.email }}</span></div>
            <div class="row"><span class="k"><Icon name="phone" :size="15" />Telefone</span><span class="v">{{ lead.contact.phone }}</span></div>
          </div>
        </div>
      </div>

      <!-- CENTER -->
      <div class="flex" style="flex-direction:column;gap:20px">
        <div class="card card-pad">
          <div class="flex aic jcb" style="margin-bottom:14px">
            <h3 class="section-title" style="margin:0">Estágio no funil</h3>
            <span v-if="!lost" class="badge badge-warn"><span class="dot" />{{ stageName }}</span>
            <span v-else class="badge badge-neg"><span class="dot" />Perdido</span>
          </div>
          <template v-if="!lost">
            <div class="stepper">
              <div v-for="(s, i) in stages" :key="s.id" class="st" :class="{ done: i < curIdx, cur: i === curIdx }" :title="s.name" />
            </div>
            <div class="flex aic jcb" style="margin-top:12px">
              <span
                v-for="(s, i) in stages" :key="s.id"
                :style="{ fontSize: '11px', fontWeight: i === curIdx ? 600 : 500, color: i <= curIdx ? 'var(--brand-700)' : 'var(--ink-3)', flex: 1, textAlign: i === 0 ? 'left' : i === stages.length - 1 ? 'right' : 'center' }"
              >{{ s.name }}</span>
            </div>
            <hr class="hr" style="margin:16px 0" />
            <div class="flex aic gap8">
              <button class="btn btn-secondary btn-sm"><Icon name="arrow-up-right" :size="15" /> Avançar estágio</button>
              <button class="btn btn-ghost btn-sm" style="color:var(--neg)"><Icon name="x" :size="15" /> Marcar como perdido</button>
            </div>
          </template>
          <div v-else class="flex aic gap12" style="background:var(--neg-bg);border:1px solid var(--neg-bd);border-radius:var(--r-md);padding:14px">
            <Icon name="x" :size="18" style="color:var(--neg)" />
            <div><div style="font-weight:600;font-size:13.5px;color:var(--neg)">Negócio perdido</div><div style="font-size:13px;color:var(--ink-2);margin-top:2px">Motivo: {{ lead.lostReason }}</div></div>
          </div>
        </div>

        <div class="card">
          <div class="tabs" style="padding:0 16px">
            <button v-for="t in tabs" :key="t.k" class="tab" :class="{ active: tab === t.k }" @click="tab = t.k">{{ t.l }}<span v-if="t.k === 'atividade'" class="c">5</span></button>
          </div>
          <div class="card-pad">
            <template v-if="tab === 'atividade'">
              <div class="composer" style="margin-bottom:24px">
                <div class="toolbar">
                  <button v-for="c in composers" :key="c.k" class="chip" :class="{ active: composer === c.k }" style="height:30px" @click="composer = c.k"><Icon :name="c.ic" :size="15" />{{ c.l }}</button>
                </div>
                <textarea :placeholder="composerPlaceholder" />
                <div class="foot">
                  <button class="icon-btn" style="width:34px;height:34px"><Icon name="paperclip" :size="16" /></button>
                  <button class="icon-btn" style="width:34px;height:34px"><Icon name="smile" :size="16" /></button>
                  <div class="grow" />
                  <button class="btn btn-primary btn-sm"><Icon name="send" :size="15" /> Registrar</button>
                </div>
              </div>
              <div class="timeline">
                <div v-for="(e, i) in TIMELINE" :key="i" class="tl-item">
                  <span class="tl-dot" :style="{ background: tlIconBg[e.type].bg, borderColor: 'transparent', color: tlIconBg[e.type].fg }"><Icon :name="tlIcon[e.type]" :size="14" /></span>
                  <div class="tl-head"><span class="who">{{ e.who }}</span><span class="act">{{ e.act }}</span><span class="tl-time">{{ e.time }}</span></div>
                  <div v-if="e.body" class="tl-body">{{ e.body }}</div>
                </div>
              </div>
            </template>
            <div v-else class="empty"><Icon name="list" :size="28" style="color:var(--line-strong);margin-bottom:10px" /><div>Nenhum registro em <b>{{ tab }}</b> ainda.</div></div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="lead-aside-r flex" style="flex-direction:column;gap:20px">
        <div class="card card-pad">
          <h3 class="section-title">Resumo do negócio</h3>
          <div style="font-size:13px;color:var(--ink-3)">Valor recorrente (MRR)</div>
          <div style="font-size:30px;font-weight:600;letter-spacing:-.02em;margin:6px 0 2px;font-family:var(--font-mono)">{{ fmtBRL(lead.value) }}<span style="font-size:14px;font-weight:500;color:var(--ink-3);font-family:var(--font)">/mês</span></div>
          <div style="font-size:13px;color:var(--ink-2)">≈ {{ fmtBRL(annual) }} / ano</div>
          <hr class="hr" style="margin:16px 0" />
          <div class="kv">
            <div class="row" style="padding-top:0"><span class="k">Ambiente</span><span class="v"><AmbienteTag :id="lead.ambiente" size="sm" /></span></div>
            <div class="row"><span class="k">Região</span><span class="v">{{ lead.estado }} · {{ lead.regiao }}</span></div>
            <div class="row"><span class="k">Probabilidade</span><span class="v">{{ lost ? '0%' : '68%' }}</span></div>
            <div class="row"><span class="k">Plano</span><span class="v">Growth · até 5k envios</span></div>
            <div class="row"><span class="k">Fechamento</span><span class="v">{{ lost ? '—' : '30 jun 2026' }}</span></div>
          </div>
          <div v-if="!lost" class="prog" style="margin-top:14px"><i style="width:68%" /></div>
        </div>

        <div class="card card-pad">
          <div class="flex aic jcb" style="margin-bottom:6px">
            <h3 class="section-title" style="margin:0">Próximas tarefas</h3>
            <button class="btn btn-ghost btn-sm"><Icon name="plus" :size="15" /></button>
          </div>
          <div class="minirow">
            <span class="act-ico" :style="{ background: lead.next.due ? 'var(--warn-bg)' : 'var(--info-bg)', color: lead.next.due ? 'var(--warn)' : 'var(--info)' }"><Icon name="mail" :size="16" /></span>
            <div class="grow">
              <div class="nm" style="font-size:13.5px">{{ lead.next.label }}</div>
              <div class="rl" :style="{ color: lead.next.due ? 'var(--warn)' : 'var(--ink-3)', fontWeight: lead.next.due ? 600 : 400 }">{{ lead.next.due ? 'Vence hoje' : fmtDate(lead.next.date) }}</div>
            </div>
          </div>
          <div v-if="lead.next.due" class="minirow"><span class="act-ico" style="background:var(--purple-bg);color:var(--purple)"><Icon name="video" :size="16" /></span><div class="grow"><div class="nm" style="font-size:13.5px">Reunião de fechamento</div><div class="rl">30 jun 2026 · 16h</div></div></div>
        </div>

        <div class="card card-pad">
          <h3 class="section-title">Arquivos</h3>
          <div class="minirow"><span class="act-ico" style="background:var(--neg-bg);color:var(--neg)"><Icon name="note" :size="16" /></span><div class="grow"><div class="nm" style="font-size:13.5px">Proposta_LojasMare_v2.pdf</div><div class="rl">2,4 MB · ontem</div></div><button class="icon-btn" style="width:32px;height:32px"><Icon name="download" :size="15" /></button></div>
          <div class="minirow"><span class="act-ico" style="background:var(--info-bg);color:var(--info)"><Icon name="note" :size="16" /></span><div class="grow"><div class="nm" style="font-size:13.5px">Diagnóstico_envios.xlsx</div><div class="rl">880 KB · 05 jun</div></div><button class="icon-btn" style="width:32px;height:32px"><Icon name="download" :size="15" /></button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { STAGES, fmtBRL, TIMELINE } from '~/utils/protoData'

const { leads } = useCrm()
const route = useRoute()
const lead = computed(() => leads.value.find((l) => l.id === route.params.id) || leads.value[0])

const tab = ref('atividade')
const composer = ref('nota')
const tabs = [{ k: 'atividade', l: 'Atividade' }, { k: 'emails', l: 'E-mails' }, { k: 'arquivos', l: 'Arquivos' }, { k: 'envios', l: 'Envios' }]
const composers = [{ k: 'nota', ic: 'note', l: 'Nota' }, { k: 'email', ic: 'mail', l: 'E-mail' }, { k: 'call', ic: 'phone', l: 'Ligação' }, { k: 'meet', ic: 'video', l: 'Reunião' }]

const TEMPC: Record<string, string> = { quente: '#DC2626', morno: '#D97706', frio: '#2563EB' }
const tempLabel: Record<string, string> = { quente: 'Quente', morno: 'Morno', frio: 'Frio' }
const tagClass: Record<string, string> = { purple: 'badge-purple', info: 'badge-info', warn: 'badge-warn', pos: 'badge-pos', neg: 'badge-neg', gray: 'badge-gray' }
const tlIcon: Record<string, string> = { note: 'note', email: 'mail', call: 'phone', meet: 'video', stage: 'arrow-up-right' }
const tlIconBg: Record<string, { bg: string; fg: string }> = {
  note: { bg: '#FFF7ED', fg: '#C2410C' }, email: { bg: '#EFF6FF', fg: '#2563EB' },
  call: { bg: '#ECFDF3', fg: '#16A34A' }, meet: { bg: '#F5F3FF', fg: '#7C3AED' }, stage: { bg: '#EFF6FF', fg: '#3B82F6' }
}

const stages = STAGES.filter((s) => s.id !== 'perdido')
const curIdx = computed(() => stages.findIndex((s) => s.id === lead.value.stage))
const lost = computed(() => lead.value.stage === 'perdido')
const stageName = computed(() => STAGES.find((s) => s.id === lead.value.stage)?.name)
const annual = computed(() => lead.value.value * 12)
const composerPlaceholder = computed(() =>
  composer.value === 'nota' ? 'Escreva uma nota sobre este negócio…'
    : composer.value === 'email' ? 'Escreva um e-mail para ' + lead.value.contact.name + '…'
      : 'Registre os detalhes…'
)
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('pt-BR') : '' }
</script>
