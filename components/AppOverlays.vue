<template>
  <div>
    <!-- Toasts -->
    <div class="toasts">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">
        <Icon :name="t.icon || 'check-circle'" :size="18" />
        <span>{{ t.msg }}</span>
      </div>
    </div>

    <!-- Novo lead -->
    <div v-if="newLeadOpen" class="modal-overlay" @mousedown="newLeadOpen = false">
      <div class="modal" style="width:580px" @mousedown.stop>
        <div class="modal-head">
          <div><h3>Novo lead</h3><p>Cadastre a empresa e a origem da captação.</p></div>
          <button class="icon-btn" aria-label="Fechar" @click="newLeadOpen = false"><Icon name="x" :size="18" /></button>
        </div>
        <div class="modal-body">
          <form id="nl-form" @submit.prevent="submitLead">
            <div class="field-label-strong">Ambiente de captação</div>
            <div class="amb-pick">
              <button
                v-for="a in ambientes" :key="a.id" type="button" class="amb-opt" :class="{ on: ambSel === a.id }"
                :style="ambSel === a.id ? { borderColor: a.color, background: a.color + '12' } : {}" @click="ambSel = a.id"
              >
                <Icon :name="a.icon" :size="16" :style="{ color: a.color }" /> {{ a.short }}
              </button>
            </div>
            <div class="field-grid" style="margin-top:18px">
              <div class="field"><label>Empresa</label><input v-model="lf.company" placeholder="Ex.: Lojas Maré" required /></div>
              <div class="field"><label>Site</label><input v-model="lf.site" placeholder="empresa.com.br" /></div>
              <div class="field"><label>Contato principal</label><input v-model="lf.contactName" placeholder="Nome do contato" /></div>
              <div class="field"><label>Cargo</label><input v-model="lf.contactRole" placeholder="Ex.: Diretor de Operações" /></div>
              <div v-if="ambSel === 'indicacao'" class="field"><label>Indicado por</label><input v-model="lf.indicadoPor" placeholder="Quem indicou" /></div>
              <div class="field"><label>Estado (UF)</label><select v-model="lf.estado"><option v-for="u in UFS" :key="u">{{ u }}</option></select></div>
              <div class="field"><label>MRR estimado (R$/mês)</label><input v-model.number="lf.value" type="number" placeholder="1990" /></div>
              <div class="field"><label>Estágio inicial</label><select v-model="lf.stage"><option v-for="s in stagesOpen" :key="s.id" :value="s.id">{{ s.name }}</option></select></div>
            </div>
          </form>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" @click="newLeadOpen = false">Cancelar</button>
          <button class="btn btn-primary" type="submit" form="nl-form" :disabled="saving"><Icon name="plus" :size="16" /> {{ saving ? 'Criando…' : 'Criar lead' }}</button>
        </div>
      </div>
    </div>

    <!-- Novo evento -->
    <div v-if="newEventOpen" class="modal-overlay" @mousedown="newEventOpen = false">
      <div class="modal" style="width:540px" @mousedown.stop>
        <div class="modal-head">
          <div><h3>Novo evento</h3><p>Agende uma reunião, ligação ou tarefa.</p></div>
          <button class="icon-btn" aria-label="Fechar" @click="newEventOpen = false"><Icon name="x" :size="18" /></button>
        </div>
        <div class="modal-body">
          <form id="ne-form" @submit.prevent="submitEvent">
            <div class="field"><label>Título</label><input v-model="ef.titulo" placeholder="Ex.: Demo técnica — Urban Bags" required /></div>
            <div class="field-grid">
              <div class="field"><label>Data</label><input v-model="ef.data" type="date" /></div>
              <div class="field"><label>Tipo</label><select v-model="ef.tipo"><option value="meet">Reunião</option><option value="call">Ligação</option><option value="task">Tarefa</option></select></div>
              <div class="field"><label>Início</label><input v-model="ef.inicio" type="time" /></div>
              <div class="field"><label>Fim</label><input v-model="ef.fim" type="time" /></div>
            </div>
            <label class="gcheck">
              <button type="button" class="toggle" :class="{ on: sync }" @click="sync = !sync" />
              <GoogleG :size="16" /> Adicionar ao Google Agenda
            </label>
          </form>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" @click="newEventOpen = false">Cancelar</button>
          <button class="btn btn-primary" type="submit" form="ne-form" :disabled="saving"><Icon name="plus" :size="16" /> {{ saving ? 'Criando…' : 'Criar evento' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { STAGES } from '~/utils/protoData'
// GoogleG/Icon são auto-importados do diretório components/.

const { newLeadOpen, newEventOpen, toasts, toast } = useOverlays()
const { ambientes, createLead } = useCrm()

const ambSel = ref('centelha')
const sync = ref(true)
const saving = ref(false)
const UFS = ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS', 'BA', 'PE', 'CE', 'GO', 'DF']
const stagesOpen = STAGES.filter((s) => s.id !== 'perdido')

const blankLead = () => ({ company: '', site: '', contactName: '', contactRole: '', indicadoPor: '', estado: 'SP', value: null as number | null, stage: 'mapeado' })
const lf = ref(blankLead())
const blankEvent = () => ({ titulo: '', data: '', tipo: 'meet', inicio: '10:00', fim: '11:00' })
const ef = ref(blankEvent())

watch(newLeadOpen, (v) => { if (v) { ambSel.value = ambientes.value[0]?.id || 'centelha'; lf.value = blankLead() } })
watch(newEventOpen, (v) => { if (v) { sync.value = true; ef.value = blankEvent() } })

async function submitLead() {
  if (saving.value || !lf.value.company.trim()) return
  saving.value = true
  try {
    await createLead({
      company: lf.value.company.trim(), site: lf.value.site, ambiente: ambSel.value,
      contactName: lf.value.contactName, contactRole: lf.value.contactRole,
      estado: lf.value.estado, value: lf.value.value || 0, stage: lf.value.stage,
      indicadoPor: ambSel.value === 'indicacao' && lf.value.indicadoPor
        ? { name: lf.value.indicadoPor, role: '', company: '', email: '', phone: '', photo: '' } : null
    })
    newLeadOpen.value = false
    toast('Lead criado e adicionado ao pipeline.', { icon: 'check-circle', type: 'pos' })
  } catch {
    toast('Não foi possível criar o lead.', { type: 'neg' })
  } finally {
    saving.value = false
  }
}

async function submitEvent() {
  if (saving.value || !ef.value.titulo.trim()) return
  saving.value = true
  let msg = 'Evento criado.'
  try {
    if (sync.value && ef.value.data) {
      const inicio = new Date(ef.value.data + 'T' + (ef.value.inicio || '09:00')).toISOString()
      const status = await $fetch<{ conectado: boolean }>('/api/google/status').catch(() => ({ conectado: false }))
      if (status.conectado) {
        await $fetch('/api/google/criar-evento', { method: 'POST', body: { titulo: ef.value.titulo, inicio } })
        msg = 'Evento criado e sincronizado com o Google Agenda.'
      } else {
        msg = 'Evento anotado (conecte o Google Agenda para sincronizar).'
      }
    }
    newEventOpen.value = false
    toast(msg, { icon: sync.value ? 'refresh' : 'calendar', type: 'pos' })
  } catch {
    toast('Não foi possível criar o evento no Google.', { type: 'neg' })
  } finally {
    saving.value = false
  }
}
</script>
