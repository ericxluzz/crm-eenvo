<template>
  <div class="screen content-pad">
    <div class="page-head"><div class="pt"><h1>Configurações</h1><p class="sub">Gerencie seu perfil, o funil, integrações e as preferências do CRM.</p></div></div>

    <div class="settings-layout">
      <aside class="set-nav">
        <button v-for="s in SECTIONS" :key="s.k" class="set-navitem" :class="{ on: sec === s.k }" @click="sec = s.k"><Icon :name="s.ic" :size="17" />{{ s.l }}</button>
      </aside>

      <div class="set-panel">
        <!-- PERFIL -->
        <div v-if="sec === 'perfil'" class="card card-pad">
          <h3 class="set-h">Perfil</h3>
          <p class="set-p">Como você aparece para o time no CRM.</p>

          <div class="cfg-avatar">
            <EAvatar :name="nome" :size="72" ring />
            <div>
              <div class="cfg-avatar-name">{{ nome }}</div>
              <div class="cfg-avatar-sub">{{ cargo }} · eenvo</div>
              <div class="flex gap8" style="margin-top:10px">
                <button class="btn btn-secondary btn-sm"><Icon name="edit" :size="15" /> Trocar foto</button>
                <button class="btn btn-ghost btn-sm">Remover</button>
              </div>
            </div>
          </div>

          <div class="cfg-divider" />

          <div class="field-grid">
            <div class="field"><label>Nome completo</label><input :value="nome" readonly /></div>
            <div class="field"><label>Cargo</label><input :value="cargo" readonly /></div>
            <div class="field"><label>E-mail</label><input :value="user?.email" readonly /></div>
            <div class="field"><label>Telefone</label><input value="+55 11 98400-1190" /></div>
            <div class="field"><label>Fuso horário</label><input value="Brasília (GMT-3)" /></div>
            <div class="field"><label>Idioma</label><input value="Português (Brasil)" /></div>
          </div>
          <div class="flex gap8">
            <button class="btn btn-primary"><Icon name="check" :size="16" /> Salvar alterações</button>
            <button class="btn btn-ghost">Cancelar</button>
          </div>
        </div>

        <!-- ETAPAS DO FUNIL -->
        <div v-else-if="sec === 'funil'" class="card card-pad">
          <h3 class="set-h">Etapas do funil</h3>
          <p class="set-p">Arraste pelo ícone para reordenar. "Perdido" é a etapa de perda e fica fixa no fim.</p>
          <div class="cfg-stages">
            <div
              v-for="s in stages" :key="s.id" class="cfg-stage"
              :class="{ dragging: dragId === s.id }" :draggable="!s.fixo"
              @dragstart="onDragStart(s)" @dragend="dragId = null"
              @dragover.prevent @drop.prevent="onDrop(s)"
            >
              <Icon name="more" :size="16" class="cfg-grip" :style="{ visibility: s.fixo ? 'hidden' : 'visible' }" />
              <span class="cfg-dot" :style="{ background: s.color }" />
              <span class="cfg-stage-name">{{ s.name }}</span>
              <span v-if="s.fixo" class="badge badge-gray" style="height:20px;font-size:11px">fixa</span>
              <span class="cfg-stage-count">{{ countStage(s.id) }} leads</span>
              <button class="icon-btn" style="width:30px;height:30px" title="Editar" @click="openEditStage(s)"><Icon name="edit" :size="15" /></button>
              <button v-if="!s.fixo" class="icon-btn" style="width:30px;height:30px" title="Excluir" @click="removeStage(s)"><Icon name="trash" :size="15" /></button>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" style="margin-top:16px" @click="openNewStage"><Icon name="plus" :size="15" /> Nova etapa</button>
        </div>

        <!-- INTEGRAÇÕES -->
        <div v-else-if="sec === 'integracoes'" class="card card-pad">
          <h3 class="set-h">Integrações</h3>
          <p class="set-p">Conecte serviços externos para automatizar o CRM.</p>

          <div class="cfg-integ">
            <div class="cfg-integ-ico"><GoogleG :size="20" /></div>
            <div class="grow">
              <div class="cfg-integ-name">Google Agenda</div>
              <div class="cfg-integ-desc">Sincronize reuniões e crie eventos direto dos leads.</div>
            </div>
            <span class="badge" :class="conectado ? 'badge-pos' : 'badge-gray'"><span class="dot" />{{ conectado ? 'Conectado' : 'Não conectado' }}</span>
            <a v-if="conectado" class="btn btn-secondary btn-sm" href="/api/google/desconectar">Desconectar</a>
            <a v-else class="btn btn-primary btn-sm" href="/api/google/conectar"><GoogleG :size="15" /> Conectar</a>
          </div>
        </div>

        <!-- PREFERÊNCIAS -->
        <div v-else class="card card-pad">
          <h3 class="set-h">Preferências</h3>
          <p class="set-p">Notificações e formatos.</p>

          <div class="field-label-strong">Notificações</div>
          <div v-for="p in prefList" :key="p.k" class="set-row">
            <div class="grow"><div class="nm">{{ p.t }}</div><div class="ds">{{ p.d }}</div></div>
            <button class="toggle" :class="{ on: prefs[p.k] }" @click="prefs[p.k] = !prefs[p.k]" />
          </div>

          <div class="cfg-divider" />

          <div class="field-label-strong">Formatos</div>
          <div class="field-grid" style="margin-bottom:0">
            <div class="field" style="margin-bottom:0"><label>Moeda</label><input value="Real (R$)" /></div>
            <div class="field" style="margin-bottom:0"><label>Formato de data</label><input value="DD/MM/AAAA" /></div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: nova / editar etapa -->
    <div v-if="stageModal" class="modal-overlay" @mousedown="stageModal = ''">
      <div class="modal" style="width:420px" @mousedown.stop>
        <div class="modal-head">
          <div><h3>{{ stageModal === 'new' ? 'Nova etapa' : 'Editar etapa' }}</h3><p>Nome e cor da etapa do funil.</p></div>
          <button class="icon-btn" aria-label="Fechar" @click="stageModal = ''"><Icon name="x" :size="18" /></button>
        </div>
        <div class="modal-body">
          <div class="field"><label>Nome</label><input v-model="sForm.name" placeholder="Ex.: Negociação" /></div>
          <div class="field" style="margin-bottom:0"><label>Cor</label>
            <div class="sw-grid">
              <button v-for="c in STAGE_COLORS" :key="c" type="button" class="sw" :class="{ on: sForm.color === c }" :style="{ background: c }" @click="sForm.color = c" />
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" @click="stageModal = ''">Cancelar</button>
          <button class="btn btn-primary" :disabled="!sForm.name || !sForm.name.trim()" @click="saveStage"><Icon name="check" :size="16" /> Salvar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { leads, stages, openStages, createStage, updateStage, deleteStage, reorderStages } = useCrm()
const { user, nome, cargo } = useMe()
const { toast } = useOverlays()

const sec = ref('perfil')
const SECTIONS = [
  { k: 'perfil', l: 'Perfil', ic: 'users' },
  { k: 'funil', l: 'Etapas do funil', ic: 'kanban' },
  { k: 'integracoes', l: 'Integrações', ic: 'globe' },
  { k: 'prefs', l: 'Preferências', ic: 'bell' }
]

const prefs = ref<Record<string, boolean>>({ resumo: true, novoLead: true, tarefa: false, semanal: true })
const prefList = [
  { k: 'resumo', t: 'Resumo diário por e-mail', d: 'Receba um panorama do pipeline toda manhã.' },
  { k: 'novoLead', t: 'Novo lead captado', d: 'Avise quando um lead entrar em qualquer ambiente.' },
  { k: 'tarefa', t: 'Lembrete de tarefa', d: 'Notificação antes do vencimento de uma ação.' },
  { k: 'semanal', t: 'Relatório semanal', d: 'Desempenho por ambiente e região, toda segunda.' }
]
const countStage = (id: string) => leads.value.filter((l: any) => l.stage === id).length

// --- Gerência de etapas do funil ---
const STAGE_COLORS = ['#8A8F99', '#2563EB', '#8E3FC4', '#0891B2', '#D97706', '#16A34A', '#DC2626', '#DB2777', '#0EA5E9', '#6366F1']
const stageModal = ref<'' | 'new' | 'edit'>('')
const sForm = ref<{ name: string; color: string }>({ name: '', color: STAGE_COLORS[0] })
const sEditId = ref<string | null>(null)
function openNewStage() { sEditId.value = null; sForm.value = { name: '', color: STAGE_COLORS[0] }; stageModal.value = 'new' }
function openEditStage(s: any) { sEditId.value = s.id; sForm.value = { name: s.name, color: s.color }; stageModal.value = 'edit' }
async function saveStage() {
  if (!sForm.value.name?.trim()) return
  try {
    if (sEditId.value) await updateStage(sEditId.value, { name: sForm.value.name, color: sForm.value.color })
    else await createStage({ name: sForm.value.name, color: sForm.value.color })
    stageModal.value = ''
    toast('Etapa salva.', { type: 'pos', icon: 'check' })
  } catch (e: any) { toast(e?.message || 'Não foi possível salvar a etapa.', { type: 'neg' }) }
}
async function removeStage(s: any) {
  try { await deleteStage(s.id); toast('Etapa excluída.', { icon: 'check' }) }
  catch (e: any) { toast(e?.message || 'Não foi possível excluir a etapa.', { type: 'neg' }) }
}
const dragId = ref<string | null>(null)
function onDragStart(s: any) { if (s.fixo) return; dragId.value = s.id }
async function onDrop(target: any) {
  const from = dragId.value; dragId.value = null
  if (!from || from === target.id || target.fixo) return
  const ids = openStages.value.map((s) => s.id)
  const fromIdx = ids.indexOf(from); const toIdx = ids.indexOf(target.id)
  if (fromIdx < 0 || toIdx < 0) return
  ids.splice(toIdx, 0, ...ids.splice(fromIdx, 1))
  await reorderStages(ids)
}

// Integração Google Agenda
// Lazy: não bloqueia a página esperando o status do Google (chamada de rede).
const { data } = useLazyAsyncData('cfg-google', () => $fetch('/api/google/status').catch(() => ({ conectado: false })))
const conectado = computed(() => !!data.value?.conectado)
</script>

<style scoped>
.cfg-avatar { display: flex; align-items: center; gap: 18px; margin: 6px 0 4px; }
.cfg-avatar-name { font-size: 16px; font-weight: 600; color: var(--ink); }
.cfg-avatar-sub { font-size: 13px; color: var(--ink-3); margin-top: 2px; }

.cfg-divider { height: 1px; background: var(--line); margin: 22px 0; }

.field-label-strong { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 12px; }

.cfg-stages { display: flex; flex-direction: column; gap: 8px; }
.cfg-stage { display: flex; align-items: center; gap: 12px; padding: 11px 13px; border: 1px solid var(--line); border-radius: var(--r-sm); background: var(--surface-2); transition: border-color .15s, background .15s; }
.cfg-stage:hover { border-color: var(--line-strong); background: var(--surface); }
.cfg-grip { color: var(--ink-3); cursor: grab; }
.cfg-dot { width: 10px; height: 10px; border-radius: 99px; flex: 0 0 10px; }
.cfg-stage-name { font-size: 13.5px; font-weight: 500; color: var(--ink); }
.cfg-stage-count { margin-left: auto; font-size: 12px; color: var(--ink-3); font-family: var(--font-mono); }
.cfg-stage[draggable=true] { cursor: grab; }
.cfg-stage.dragging { opacity: .45; }
.sw-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.sw { width: 28px; height: 28px; border-radius: 8px; border: 2px solid transparent; cursor: pointer; padding: 0; outline: none; }
.sw.on { border-color: #fff; box-shadow: 0 0 0 2px var(--ink); }

.cfg-integ { display: flex; align-items: center; gap: 14px; padding: 16px; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface-2); }
.cfg-integ-ico { width: 44px; height: 44px; border-radius: 11px; display: grid; place-items: center; flex: 0 0 44px; background: var(--surface); border: 1px solid var(--line); }
.cfg-integ-name { font-size: 14.5px; font-weight: 600; color: var(--ink); }
.cfg-integ-desc { font-size: 13px; color: var(--ink-2); margin-top: 2px; }
</style>
