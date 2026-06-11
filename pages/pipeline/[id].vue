<template>
  <div class="screen content-pad" :data-screen-label="'Lead ' + lead.company">
    <div class="flex aic gap12" style="margin-bottom:18px">
      <NuxtLink to="/pipeline" class="btn btn-secondary btn-sm"><Icon name="chevron-left" :size="15" /> Pipeline</NuxtLink>
      <div class="flex aic gap8 muted" style="font-size:13px">
        <span>Pipeline</span><Icon name="chevron-right" :size="14" /><span style="color:var(--ink);font-weight:500">{{ lead.company }}</span>
      </div>
      <div style="margin-left:auto" class="flex aic gap8">
        <span class="badge badge-gray" style="font-family:var(--font-mono)">{{ lead.id }}</span>
        <div style="position:relative">
          <button class="icon-btn" title="Mais" @click="moreOpen = !moreOpen"><Icon name="more" :size="18" /></button>
          <div v-if="moreOpen" class="more-menu">
            <button @click="openEdit()"><Icon name="edit" :size="15" /> Editar dados do lead</button>
          </div>
        </div>
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
            <a class="btn btn-primary grow" :href="'mailto:' + (principal.email || '')"><Icon name="mail" :size="16" /> E-mail</a>
            <a class="btn btn-secondary" title="Ligar" :href="'tel:' + (principal.phone || '')"><Icon name="phone" :size="16" /></a>
            <button class="btn btn-secondary" title="Agendar" @click="openTask()"><Icon name="calendar" :size="16" /></button>
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
            <button class="btn btn-ghost btn-sm" @click="openContact()"><Icon name="plus" :size="15" /> Adicionar</button>
          </div>
          <div v-for="(c, i) in contacts" :key="c.id" :style="i ? 'border-top:1px solid var(--line);padding-top:12px;margin-top:12px' : ''">
            <div class="minirow" style="border-bottom:0;padding-bottom:4px">
              <EAvatar :name="c.name" :photo="c.photo" :size="38" />
              <div class="grow"><div class="nm">{{ c.name }}</div><div class="rl">{{ c.role }}</div></div>
              <span v-if="i === 0" class="badge badge-info" style="height:22px">Principal</span>
              <button class="icon-btn" style="width:30px;height:30px" title="Editar" @click="openContact(c)"><Icon name="edit" :size="14" /></button>
              <button v-if="c.id !== 'primary'" class="icon-btn" style="width:30px;height:30px" title="Remover" @click="removeContact(c)"><Icon name="trash" :size="14" /></button>
            </div>
            <div class="kv">
              <div v-if="c.email" class="row"><span class="k"><Icon name="mail" :size="15" />E-mail</span><span class="v truncate">{{ c.email }}</span></div>
              <div v-if="c.phone" class="row"><span class="k"><Icon name="phone" :size="15" />Telefone</span><span class="v">{{ c.phone }}</span></div>
            </div>
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
              <button class="btn btn-secondary btn-sm" @click="avancar"><Icon name="arrow-up-right" :size="15" /> Avançar estágio</button>
              <button class="btn btn-ghost btn-sm" style="color:var(--neg)" @click="openLost"><Icon name="x" :size="15" /> Marcar como perdido</button>
            </div>
          </template>
          <div v-else>
            <div class="flex aic gap12" style="background:var(--neg-bg);border:1px solid var(--neg-bd);border-radius:var(--r-md);padding:14px">
              <Icon name="x" :size="18" style="color:var(--neg)" />
              <div class="grow"><div style="font-weight:600;font-size:13.5px;color:var(--neg)">Negócio perdido</div><div style="font-size:13px;color:var(--ink-2);margin-top:2px">Motivo: {{ lead.lostReason }}</div></div>
              <button class="btn btn-secondary btn-sm" @click="reabrir"><Icon name="refresh" :size="15" /> Reabrir</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="tabs" style="padding:0 16px">
            <button v-for="t in tabs" :key="t.k" class="tab" :class="{ active: tab === t.k }" @click="tab = t.k">{{ t.l }}<span v-if="t.k === 'atividade'" class="c">{{ activities.length }}</span></button>
          </div>
          <div class="card-pad">
            <template v-if="tab === 'atividade'">
              <div class="composer" style="margin-bottom:24px">
                <div class="toolbar">
                  <button v-for="c in composers" :key="c.k" class="chip" :class="{ active: composer === c.k }" style="height:30px" @click="composer = c.k"><Icon :name="c.ic" :size="15" />{{ c.l }}</button>
                </div>
                <textarea v-model="draft" :placeholder="composerPlaceholder" @keydown.meta.enter="registrar" @keydown.ctrl.enter="registrar" />
                <div class="foot">
                  <button class="icon-btn" style="width:34px;height:34px" title="Anexar arquivo" @click="pickFile"><Icon name="paperclip" :size="16" /></button>
                  <div class="grow" />
                  <button class="btn btn-primary btn-sm" :disabled="!draft.trim()" @click="registrar"><Icon name="send" :size="15" /> Registrar</button>
                </div>
              </div>
              <div class="timeline">
                <div v-for="(e, i) in activities" :key="i" class="tl-item">
                  <span class="tl-dot" :style="{ background: (tlIconBg[e.type] || tlIconBg.note).bg, borderColor: 'transparent', color: (tlIconBg[e.type] || tlIconBg.note).fg }"><Icon :name="tlIcon[e.type] || 'note'" :size="14" /></span>
                  <div class="tl-head"><span class="who">{{ e.who }}</span><span class="act">{{ e.act }}</span><span class="tl-time">{{ e.time }}</span></div>
                  <div v-if="e.body" class="tl-body">{{ e.body }}</div>
                </div>
              </div>
            </template>

            <template v-else-if="tab === 'emails'">
              <div v-if="emailActs.length" class="timeline">
                <div v-for="(e, i) in emailActs" :key="i" class="tl-item">
                  <span class="tl-dot" :style="{ background: tlIconBg.email.bg, color: tlIconBg.email.fg }"><Icon name="mail" :size="14" /></span>
                  <div class="tl-head"><span class="who">{{ e.who }}</span><span class="act">{{ e.act }}</span><span class="tl-time">{{ e.time }}</span></div>
                  <div v-if="e.body" class="tl-body">{{ e.body }}</div>
                </div>
              </div>
              <div v-else class="empty"><Icon name="mail" :size="28" style="color:var(--line-strong);margin-bottom:10px" /><div>Nenhum e-mail registrado ainda.</div></div>
            </template>

            <template v-else-if="tab === 'arquivos'">
              <div v-if="attachments.length" class="kv" style="gap:0">
                <div v-for="a in attachments" :key="a.id" class="minirow">
                  <span class="act-ico" style="background:var(--info-bg);color:var(--info)"><Icon name="note" :size="16" /></span>
                  <div class="grow"><div class="nm" style="font-size:13.5px">{{ a.name }}</div><div class="rl">{{ fmtSize(a.size) }} · {{ fmtDate(a.at) }}</div></div>
                  <button class="icon-btn" style="width:32px;height:32px" title="Baixar" @click="baixar(a)"><Icon name="download" :size="15" /></button>
                </div>
              </div>
              <div v-else class="empty"><Icon name="note" :size="28" style="color:var(--line-strong);margin-bottom:10px" /><div>Nenhum arquivo anexado ainda.</div></div>
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
            <div class="row"><span class="k">Estágio</span><span class="v">{{ lost ? 'Perdido' : stageName }}</span></div>
          </div>
        </div>

        <div class="card card-pad">
          <div class="flex aic jcb" style="margin-bottom:6px">
            <h3 class="section-title" style="margin:0">Próximas tarefas</h3>
            <button class="btn btn-ghost btn-sm" title="Adicionar tarefa" @click="openTask()"><Icon name="plus" :size="15" /></button>
          </div>
          <div v-if="!tasks.length" class="empty" style="padding:18px 0"><div>Nenhuma tarefa. Clique em + para adicionar.</div></div>
          <div v-for="t in tasks" :key="t.id" class="minirow">
            <button class="task-check" :style="{ background: t.done ? 'var(--pos)' : 'transparent', borderColor: t.done ? 'var(--pos)' : 'var(--line-strong)' }" title="Concluir" @click="toggleTask(t)"><Icon v-if="t.done" name="check" :size="12" /></button>
            <div class="grow">
              <div class="nm" :style="{ fontSize: '13.5px', textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--ink-3)' : 'var(--ink)' }">{{ t.label }}</div>
              <div class="rl" :style="{ color: t.due && !t.done ? 'var(--warn)' : 'var(--ink-3)', fontWeight: t.due && !t.done ? 600 : 400 }">{{ taskWhen(t) }}</div>
            </div>
            <button class="icon-btn" style="width:30px;height:30px" title="Remover" @click="removeTask(t)"><Icon name="trash" :size="14" /></button>
          </div>
        </div>

        <div class="card card-pad">
          <div class="flex aic jcb" style="margin-bottom:6px">
            <h3 class="section-title" style="margin:0">Arquivos</h3>
            <button class="btn btn-ghost btn-sm" title="Anexar arquivo" @click="pickFile"><Icon name="paperclip" :size="15" /> Anexar</button>
          </div>
          <div v-if="!attachments.length" class="empty" style="padding:18px 0"><div>Nenhum arquivo. Anexe propostas e documentos (até 10 MB).</div></div>
          <div v-for="a in attachments" :key="a.id" class="minirow">
            <span class="act-ico" style="background:var(--info-bg);color:var(--info)"><Icon name="note" :size="16" /></span>
            <div class="grow"><div class="nm" style="font-size:13.5px">{{ a.name }}</div><div class="rl">{{ fmtSize(a.size) }} · {{ fmtDate(a.at) }}</div></div>
            <button class="icon-btn" style="width:32px;height:32px" title="Baixar" @click="baixar(a)"><Icon name="download" :size="15" /></button>
            <button class="icon-btn" style="width:32px;height:32px" title="Remover" @click="removeAtt(a)"><Icon name="trash" :size="14" /></button>
          </div>
        </div>
      </div>
    </div>

    <!-- input de arquivo escondido (compartilhado) -->
    <input ref="fileInput" type="file" style="display:none" @change="onFile">

    <!-- backdrop do menu "Mais" -->
    <div v-if="moreOpen" style="position:fixed;inset:0;z-index:40" @click="moreOpen = false" />

    <!-- MODAL: contato -->
    <div v-if="modal === 'contact'" class="modal-overlay" @mousedown="modal = ''">
      <div class="modal" style="width:480px" @mousedown.stop>
        <div class="modal-head">
          <div><h3>{{ cEditId ? 'Editar contato' : 'Novo contato' }}</h3><p>Pessoa de contato neste negócio.</p></div>
          <button class="icon-btn" aria-label="Fechar" @click="modal = ''"><Icon name="x" :size="18" /></button>
        </div>
        <div class="modal-body">
          <div style="display:grid;gap:12px">
            <div class="field"><label>Nome</label><input v-model="cForm.name" placeholder="Nome completo" /></div>
            <div class="field"><label>Cargo</label><input v-model="cForm.role" placeholder="Cargo / função" /></div>
            <div class="field"><label>E-mail</label><input v-model="cForm.email" type="email" placeholder="email@empresa.com" /></div>
            <div class="field"><label>Telefone</label><input v-model="cForm.phone" placeholder="+55 ..." /></div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" @click="modal = ''">Cancelar</button>
          <button class="btn btn-primary" :disabled="!cForm.name || !cForm.name.trim()" @click="saveContact"><Icon name="check" :size="16" /> Salvar</button>
        </div>
      </div>
    </div>

    <!-- MODAL: tarefa -->
    <div v-if="modal === 'task'" class="modal-overlay" @mousedown="modal = ''">
      <div class="modal" style="width:480px" @mousedown.stop>
        <div class="modal-head">
          <div><h3>{{ tEditId ? 'Editar tarefa' : 'Nova tarefa' }}</h3><p>Salva no lead. Com o Google conectado, cria também o evento na agenda.</p></div>
          <button class="icon-btn" aria-label="Fechar" @click="modal = ''"><Icon name="x" :size="18" /></button>
        </div>
        <div class="modal-body">
          <div style="display:grid;gap:12px">
            <div class="field"><label>Descrição</label><input v-model="tForm.label" placeholder="Ex.: Enviar contrato revisado" /></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div class="field"><label>Data</label><input v-model="tForm.date" type="date" /></div>
              <div class="field"><label>Hora (opcional)</label><input v-model="tForm.time" type="time" /></div>
            </div>
            <div class="field"><label>Tipo</label>
              <select v-model="tForm.type">
                <option value="tarefa">Tarefa</option>
                <option value="call">Ligação</option>
                <option value="email">E-mail</option>
                <option value="meet">Reunião</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" @click="modal = ''">Cancelar</button>
          <button class="btn btn-primary" :disabled="!tForm.label || !tForm.label.trim() || saving" @click="saveTask"><Icon name="check" :size="16" /> {{ saving ? 'Salvando…' : 'Salvar' }}</button>
        </div>
      </div>
    </div>

    <!-- MODAL: marcar como perdido -->
    <div v-if="modal === 'lost'" class="modal-overlay" @mousedown="modal = ''">
      <div class="modal" style="width:460px" @mousedown.stop>
        <div class="modal-head">
          <div><h3>Marcar como perdido</h3><p>Selecione o motivo da perda.</p></div>
          <button class="icon-btn" aria-label="Fechar" @click="modal = ''"><Icon name="x" :size="18" /></button>
        </div>
        <div class="modal-body">
          <div class="flex gap8" style="flex-wrap:wrap">
            <button v-for="m in MOTIVOS" :key="m" class="chip" :class="{ active: lostReason === m }" @click="lostReason = m">{{ m }}</button>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" @click="modal = ''">Cancelar</button>
          <button class="btn btn-primary" style="background:var(--neg);border-color:var(--neg)" :disabled="!lostReason" @click="confirmLost"><Icon name="x" :size="16" /> Confirmar perda</button>
        </div>
      </div>
    </div>

    <!-- MODAL: editar dados do lead -->
    <div v-if="modal === 'edit'" class="modal-overlay" @mousedown="modal = ''">
      <div class="modal" style="width:480px" @mousedown.stop>
        <div class="modal-head">
          <div><h3>Editar dados do lead</h3><p>Atualize as informações da empresa.</p></div>
          <button class="icon-btn" aria-label="Fechar" @click="modal = ''"><Icon name="x" :size="18" /></button>
        </div>
        <div class="modal-body">
          <div style="display:grid;gap:12px">
            <div class="field"><label>Empresa</label><input v-model="eForm.company" /></div>
            <div class="field"><label>Site</label><input v-model="eForm.site" /></div>
            <div class="field"><label>Segmento</label><input v-model="eForm.seg" /></div>
            <div class="field"><label>MRR (R$/mês)</label><input v-model.number="eForm.value" type="number" /></div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" @click="modal = ''">Cancelar</button>
          <button class="btn btn-primary" @click="saveEdit"><Icon name="check" :size="16" /> Salvar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { STAGES, fmtBRL } from '~/utils/protoData'

const { leads, updateLead, addLeadItem, updateLeadItem, removeLeadItem, setLeadNext } = useCrm()
const { toast } = useOverlays()
const supabase = useSupabaseClient()
const route = useRoute()
const lead = computed(() => leads.value.find((l) => l.id === route.params.id) || leads.value[0])

const tab = ref('atividade')
const composer = ref('nota')
const tabs = [{ k: 'atividade', l: 'Atividade' }, { k: 'emails', l: 'E-mails' }, { k: 'arquivos', l: 'Arquivos' }, { k: 'envios', l: 'Envios' }]
const composers = [{ k: 'nota', ic: 'note', l: 'Nota' }, { k: 'email', ic: 'mail', l: 'E-mail' }, { k: 'call', ic: 'phone', l: 'Ligação' }, { k: 'meet', ic: 'video', l: 'Reunião' }]

const TEMPC: Record<string, string> = { quente: '#DC2626', morno: '#D97706', frio: '#2563EB' }
const tempLabel: Record<string, string> = { quente: 'Quente', morno: 'Morno', frio: 'Frio' }
const tagClass: Record<string, string> = { purple: 'badge-purple', info: 'badge-info', warn: 'badge-warn', pos: 'badge-pos', neg: 'badge-neg', gray: 'badge-gray' }
const tlIcon: Record<string, string> = { note: 'note', email: 'mail', call: 'phone', meet: 'video', stage: 'arrow-up-right', tarefa: 'check-circle' }
const tlIconBg: Record<string, { bg: string; fg: string }> = {
  note: { bg: '#FFF7ED', fg: '#C2410C' }, email: { bg: '#EFF6FF', fg: '#2563EB' },
  call: { bg: '#ECFDF3', fg: '#16A34A' }, meet: { bg: '#F5F3FF', fg: '#7C3AED' },
  stage: { bg: '#EFF6FF', fg: '#3B82F6' }, tarefa: { bg: '#FFF7ED', fg: '#C2410C' }
}

const stages = STAGES.filter((s) => s.id !== 'perdido')
const curIdx = computed(() => stages.findIndex((s) => s.id === lead.value.stage))
const lost = computed(() => lead.value.stage === 'perdido')
const stageName = computed(() => STAGES.find((s) => s.id === lead.value.stage)?.name)
const annual = computed(() => lead.value.value * 12)
const composerPlaceholder = computed(() =>
  composer.value === 'nota' ? 'Escreva uma nota sobre este negócio…'
    : composer.value === 'email' ? 'Escreva um e-mail para ' + (lead.value.contact?.name || 'o contato') + '…'
      : 'Registre os detalhes…'
)
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('pt-BR') : '' }

// ---- Arrays de exibição (seed a partir dos campos singulares + override) ----
const contacts = computed<any[]>(() => {
  const l: any = lead.value
  if (Array.isArray(l.contacts)) return l.contacts
  return l.contact ? [{ ...l.contact, id: 'primary' }] : []
})
const principal = computed<any>(() => contacts.value[0] || {})
const tasks = computed<any[]>(() => {
  const l: any = lead.value
  if (Array.isArray(l.tasks)) return l.tasks
  return l.next ? [{ id: 'seed', label: l.next.label, date: l.next.date, due: l.next.due, type: 'tarefa', done: false }] : []
})
// Atividades vêm do banco já ordenadas (mais recente primeiro).
const userActs = computed<any[]>(() => Array.isArray((lead.value as any).activities) ? (lead.value as any).activities : [])
const activities = computed<any[]>(() => userActs.value)
const emailActs = computed(() => activities.value.filter((a) => a.type === 'email'))
const attachments = computed<any[]>(() => Array.isArray((lead.value as any).attachments) ? (lead.value as any).attachments : [])

function taskWhen(t: any) {
  if (t.done) return 'Concluída'
  if (t.due) return 'Vence hoje'
  return t.date ? fmtDate(t.date) + (t.time ? ' · ' + t.time : '') : 'Sem data'
}

// ---- Modais ----
const modal = ref<'' | 'contact' | 'task' | 'lost' | 'edit'>('')
const moreOpen = ref(false)

// Contato
const cForm = ref<any>({})
const cEditId = ref<string | null>(null)
function openContact(c?: any) {
  cEditId.value = c?.id ?? null
  cForm.value = c ? { name: c.name, role: c.role, email: c.email, phone: c.phone } : { name: '', role: '', email: '', phone: '' }
  modal.value = 'contact'
}
function saveContact() {
  if (!cForm.value.name?.trim()) return
  const id = lead.value.id
  if (cEditId.value) updateLeadItem(id, 'contacts', cEditId.value, { ...cForm.value }, contacts.value)
  else addLeadItem(id, 'contacts', { id: crypto.randomUUID(), ...cForm.value }, contacts.value)
  modal.value = ''
  toast(cEditId.value ? 'Contato atualizado.' : 'Contato adicionado.', { type: 'pos', icon: 'check' })
}
function removeContact(c: any) {
  removeLeadItem(lead.value.id, 'contacts', c.id, contacts.value)
  toast('Contato removido.', { icon: 'check' })
}

// Tarefa
const tForm = ref<any>({})
const tEditId = ref<string | null>(null)
const saving = ref(false)
function openTask(t?: any) {
  tEditId.value = t?.id ?? null
  tForm.value = t ? { label: t.label, date: t.date || '', time: t.time || '', type: t.type || 'tarefa' } : { label: '', date: '', time: '', type: 'tarefa' }
  modal.value = 'task'
}
async function saveTask() {
  if (!tForm.value.label?.trim() || saving.value) return
  const id = lead.value.id
  const item = { id: tEditId.value || crypto.randomUUID(), label: tForm.value.label.trim(), date: tForm.value.date, time: tForm.value.time, type: tForm.value.type, done: false }
  const nextList = tEditId.value
    ? tasks.value.map((t) => (t.id === tEditId.value ? item : t))
    : [...tasks.value, item]
  if (tEditId.value) updateLeadItem(id, 'tasks', tEditId.value, item, tasks.value)
  else addLeadItem(id, 'tasks', item, tasks.value)
  const pend = nextList.filter((t) => !t.done)
  setLeadNext(id, pend[0] ? { label: pend[0].label, date: pend[0].date, due: false } : null)
  modal.value = ''

  // Google Agenda quando conectado (não bloqueia: falha nunca perde a tarefa local)
  let msg = 'Tarefa salva.'
  saving.value = true
  try {
    if (item.date) {
      const status = await $fetch<{ conectado: boolean }>('/api/google/status').catch(() => ({ conectado: false }))
      if (status.conectado) {
        const inicio = new Date(item.date + 'T' + (item.time || '09:00')).toISOString()
        await $fetch('/api/google/criar-evento', { method: 'POST', body: { titulo: item.label, descricao: lead.value.company, inicio } })
        msg = 'Tarefa salva e evento criado no Google Agenda.'
      }
    }
  } catch {
    msg = 'Tarefa salva (não foi possível criar no Google Agenda).'
  } finally {
    saving.value = false
  }
  toast(msg, { type: 'pos', icon: 'check' })
}
function toggleTask(t: any) {
  const id = lead.value.id
  updateLeadItem(id, 'tasks', t.id, { done: !t.done }, tasks.value)
  const pend = tasks.value.map((x) => (x.id === t.id ? { ...x, done: !t.done } : x)).filter((x) => !x.done)
  setLeadNext(id, pend[0] ? { label: pend[0].label, date: pend[0].date, due: false } : null)
}
function removeTask(t: any) {
  const id = lead.value.id
  removeLeadItem(id, 'tasks', t.id, tasks.value)
  const pend = tasks.value.filter((x) => x.id !== t.id).filter((x) => !x.done)
  setLeadNext(id, pend[0] ? { label: pend[0].label, date: pend[0].date, due: false } : null)
  toast('Tarefa removida.', { icon: 'check' })
}

// Atividade (composer)
const draft = ref('')
const actLabel: Record<string, string> = { nota: 'adicionou uma nota', email: 'enviou um e-mail', call: 'registrou uma ligação', meet: 'realizou uma reunião' }
// A chave do composer ('nota') difere da chave dos ícones da timeline ('note').
const actType: Record<string, string> = { nota: 'note', email: 'email', call: 'call', meet: 'meet' }
function registrar() {
  const body = draft.value.trim()
  if (!body) { toast('Escreva algo antes de registrar.', { type: 'warn' }); return }
  const now = new Date()
  const time = 'Hoje · ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  addLeadItem(lead.value.id, 'activities', { id: crypto.randomUUID(), type: actType[composer.value] || 'note', who: 'Você', act: actLabel[composer.value] || 'registrou', time, body }, userActs.value)
  draft.value = ''
  toast('Registro adicionado à timeline.', { type: 'pos', icon: 'check' })
}

// Anexos (Supabase Storage)
const fileInput = ref<HTMLInputElement | null>(null)
function pickFile() { fileInput.value?.click() }
async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) { toast('Arquivo acima de 10 MB.', { type: 'neg' }); input.value = ''; return }
  try {
    const { path, token } = await $fetch<{ path: string; token: string }>('/api/anexos/sign-upload', {
      method: 'POST', body: { leadId: lead.value.id, filename: file.name, size: file.size }
    })
    const { error } = await supabase.storage.from('lead-anexos').uploadToSignedUrl(path, token, file)
    if (error) throw error
    addLeadItem(lead.value.id, 'attachments', { id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type, path, at: new Date().toISOString() }, attachments.value)
    toast('Arquivo anexado.', { type: 'pos', icon: 'check' })
  } catch {
    toast('Falha ao anexar arquivo.', { type: 'neg' })
  } finally {
    input.value = ''
  }
}
async function baixar(a: any) {
  try {
    const { url } = await $fetch<{ url: string }>('/api/anexos/url', { query: { path: a.path } })
    window.open(url, '_blank')
  } catch {
    toast('Não foi possível abrir o arquivo.', { type: 'neg' })
  }
}
function removeAtt(a: any) {
  removeLeadItem(lead.value.id, 'attachments', a.id, attachments.value)
  toast('Anexo removido.', { icon: 'check' })
}
function fmtSize(b: number) { return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB' }

// Estágio
function avancar() {
  const cur = stages.findIndex((s) => s.id === lead.value.stage)
  const next = stages[cur + 1]
  if (!next) { toast('Já está no último estágio.', { type: 'warn' }); return }
  const now = new Date()
  updateLead(lead.value.id, { stage: next.id })
  addLeadItem(lead.value.id, 'activities', { id: crypto.randomUUID(), type: 'stage', who: 'Você', act: 'moveu para ' + next.name, time: 'Hoje · ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), body: '' }, userActs.value)
  toast('Avançou para ' + next.name + '.', { type: 'pos', icon: 'check' })
}
const lostReason = ref('')
const MOTIVOS = ['Preço', 'Timing', 'Concorrente', 'Sem resposta', 'Outro']
function openLost() { lostReason.value = ''; modal.value = 'lost' }
function confirmLost() {
  if (!lostReason.value) return
  updateLead(lead.value.id, { stage: 'perdido', lostReason: lostReason.value, prevStage: lead.value.stage })
  modal.value = ''
  toast('Negócio marcado como perdido.', { icon: 'check' })
}
function reabrir() {
  const back = (lead.value as any).prevStage || 'mapeado'
  updateLead(lead.value.id, { stage: back })
  toast('Negócio reaberto.', { type: 'pos', icon: 'check' })
}

// Editar dados do lead
const eForm = ref<any>({})
function openEdit() {
  const l = lead.value
  eForm.value = { company: l.company, site: l.site, seg: l.seg, value: l.value }
  moreOpen.value = false
  modal.value = 'edit'
}
function saveEdit() {
  updateLead(lead.value.id, { company: eForm.value.company, site: eForm.value.site, seg: eForm.value.seg, value: Number(eForm.value.value) || 0 })
  modal.value = ''
  toast('Lead atualizado.', { type: 'pos', icon: 'check' })
}
</script>

<style scoped>
.more-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 50;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  box-shadow: 0 8px 24px rgba(0, 0, 0, .12);
  padding: 6px;
  min-width: 200px;
}
.more-menu button {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 9px 11px;
  border: 0;
  background: transparent;
  border-radius: 8px;
  font: inherit;
  font-size: 13.5px;
  color: var(--ink);
  cursor: pointer;
  text-align: left;
}
.more-menu button:hover { background: var(--surface-2); }
.task-check {
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid var(--line-strong);
  display: grid;
  place-items: center;
  color: #fff;
  cursor: pointer;
  padding: 0;
}
</style>
