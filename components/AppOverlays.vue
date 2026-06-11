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
                v-for="a in AMBIENTES" :key="a.id" type="button" class="amb-opt" :class="{ on: ambSel === a.id }"
                :style="ambSel === a.id ? { borderColor: a.color, background: a.color + '12' } : {}" @click="ambSel = a.id"
              >
                <Icon :name="a.icon" :size="16" :style="{ color: a.color }" /> {{ a.short }}
              </button>
            </div>
            <div class="field-grid" style="margin-top:18px">
              <div class="field"><label>Empresa</label><input placeholder="Ex.: Lojas Maré" required /></div>
              <div class="field"><label>Site</label><input placeholder="empresa.com.br" /></div>
              <div class="field"><label>Contato principal</label><input placeholder="Nome do contato" /></div>
              <div class="field"><label>Cargo</label><input placeholder="Ex.: Diretor de Operações" /></div>
              <div v-if="ambSel === 'indicacao'" class="field"><label>Indicado por</label><input placeholder="Quem indicou" /></div>
              <div class="field"><label>Estado (UF)</label><select><option v-for="u in UFS" :key="u">{{ u }}</option></select></div>
              <div class="field"><label>MRR estimado (R$/mês)</label><input type="number" placeholder="1990" /></div>
              <div class="field"><label>Estágio inicial</label><select><option v-for="s in stagesOpen" :key="s.id" :value="s.id">{{ s.name }}</option></select></div>
            </div>
          </form>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" @click="newLeadOpen = false">Cancelar</button>
          <button class="btn btn-primary" type="submit" form="nl-form"><Icon name="plus" :size="16" /> Criar lead</button>
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
            <div class="field"><label>Título</label><input placeholder="Ex.: Demo técnica — Urban Bags" required /></div>
            <div class="field-grid">
              <div class="field"><label>Data</label><input type="date" value="2026-06-11" /></div>
              <div class="field"><label>Tipo</label><select><option value="meet">Reunião</option><option value="call">Ligação</option><option value="task">Tarefa</option></select></div>
              <div class="field"><label>Início</label><input type="time" value="10:00" /></div>
              <div class="field"><label>Fim</label><input type="time" value="11:00" /></div>
            </div>
            <label class="gcheck">
              <button type="button" class="toggle" :class="{ on: sync }" @click="sync = !sync" />
              <GoogleG :size="16" /> Adicionar ao Google Agenda
            </label>
          </form>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" @click="newEventOpen = false">Cancelar</button>
          <button class="btn btn-primary" type="submit" form="ne-form"><Icon name="plus" :size="16" /> Criar evento</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AMBIENTES, STAGES } from '~/utils/protoData'
// GoogleG/Icon são auto-importados do diretório components/.

const { newLeadOpen, newEventOpen, toasts, toast } = useOverlays()
const ambSel = ref('centelha')
const sync = ref(true)
const UFS = ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS', 'BA', 'PE', 'CE', 'GO', 'DF']
const stagesOpen = STAGES.filter((s) => s.id !== 'perdido')

watch(newLeadOpen, (v) => { if (v) ambSel.value = 'centelha' })
watch(newEventOpen, (v) => { if (v) sync.value = true })

function submitLead() { newLeadOpen.value = false; toast('Lead criado e adicionado ao pipeline', { icon: 'check-circle' }) }
function submitEvent() { newEventOpen.value = false; toast(sync.value ? 'Evento criado e sincronizado com o Google' : 'Evento criado', { icon: sync.value ? 'refresh' : 'calendar' }) }
</script>
