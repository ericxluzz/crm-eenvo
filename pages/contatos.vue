<template>
  <div class="screen content-pad">
    <div class="page-head">
      <div class="pt"><h1>Contatos & empresas</h1><p class="sub">{{ leads.length }} empresas no CRM da eenvo</p></div>
      <div class="acts">
        <button class="btn btn-secondary"><Icon name="download" :size="16" /> Importar</button>
        <button class="btn btn-primary" @click="openNewLead"><Icon name="plus" :size="17" /> Nova empresa</button>
      </div>
    </div>

    <div class="card">
      <div class="flex aic gap12" style="padding:14px 16px;border-bottom:1px solid var(--line)">
        <div class="tabs" style="border:0;flex:1">
          <button v-for="t in tabsList" :key="t.k" class="tab" :class="{ active: tab === t.k }" @click="tab = t.k">{{ t.l }}<span class="c">{{ t.c }}</span></button>
        </div>
        <div class="search" style="max-width:260px">
          <Icon name="search" :size="16" /><input v-model="q" placeholder="Buscar empresa, contato ou UF…" style="height:36px" />
        </div>
        <button class="chip"><Icon name="filter" :size="15" /> Filtros</button>
      </div>
      <div style="overflow-x:auto">
        <table class="tbl">
          <thead><tr><th>Empresa</th><th>Contato principal</th><th>Segmento</th><th>Estágio</th><th>MRR</th><th>Ambiente</th><th>Região</th><th style="width:80px" /></tr></thead>
          <tbody>
            <tr v-for="l in rows" :key="l.id" @click="open(l.id)">
              <td><div class="flex aic gap8" style="gap:11px"><CompanyLogo :lead="l" /><div><div class="cell-strong">{{ l.company }}</div><div class="cell-mute" style="font-size:12px">{{ l.site }}</div></div></div></td>
              <td><div class="flex aic gap8"><EAvatar :name="l.contact.name" :photo="l.contact.photo" :size="30" /><div><div class="cell-strong" style="font-weight:500;color:var(--ink)">{{ l.contact.name }}</div><div class="cell-mute" style="font-size:12px">{{ l.contact.role }}</div></div></div></td>
              <td>{{ l.seg }}</td>
              <td><StageBadge :stage="l.stage" /></td>
              <td class="cell-strong" style="font-family:var(--font-mono)">{{ fmtBRL(l.value) }}</td>
              <td><AmbienteTag :id="l.ambiente" size="sm" /></td>
              <td><span style="font-size:13px">{{ l.estado }} · {{ l.regiao }}</span></td>
              <td>
                <div class="flex aic gap8" style="justify-content:flex-end">
                  <button class="icon-btn" style="width:32px;height:32px" title="Editar" @click.stop="openEdit(l)"><Icon name="edit" :size="15" /></button>
                  <Icon name="chevron-right" :size="16" style="color:var(--ink-3)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Editar empresa -->
    <div v-if="editing" class="modal-overlay" @mousedown="editingId = null">
      <div class="modal" style="width:600px" @mousedown.stop>
        <div class="modal-head">
          <div><h3>Editar empresa</h3><p>Atualize os dados e o logo de identificação.</p></div>
          <button class="icon-btn" aria-label="Fechar" @click="editingId = null"><Icon name="x" :size="18" /></button>
        </div>
        <div class="modal-body">
          <div class="flex aic gap16" style="margin-bottom:18px">
            <CompanyLogo :lead="editing" :size="64" :radius="15" :font-size="24" />
            <div>
              <div class="cell-strong" style="font-size:14px">Logo de identificação</div>
              <div class="muted" style="font-size:12.5px;margin-bottom:8px">Clique no logo para enviar uma imagem.</div>
              <button v-if="editing.logoUrl" class="btn btn-ghost btn-sm" @click="removeLogo"><Icon name="trash" :size="14" /> Remover logo</button>
            </div>
          </div>
          <div class="field-grid">
            <div class="field"><label>Empresa</label><input v-model="form.company" /></div>
            <div class="field"><label>Site</label><input v-model="form.site" /></div>
            <div class="field"><label>Segmento</label><input v-model="form.seg" /></div>
            <div class="field"><label>MRR (R$/mês)</label><input v-model.number="form.value" type="number" /></div>
            <div class="field"><label>Contato principal</label><input v-model="form.nome" /></div>
            <div class="field"><label>Cargo</label><input v-model="form.cargo" /></div>
            <div class="field"><label>E-mail</label><input v-model="form.email" /></div>
            <div class="field"><label>Telefone</label><input v-model="form.telefone" /></div>
            <div class="field"><label>Estado (UF)</label><select v-model="form.estado"><option v-for="u in UFS" :key="u">{{ u }}</option></select></div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" @click="editingId = null">Cancelar</button>
          <button class="btn btn-primary" @click="save"><Icon name="check" :size="16" /> Salvar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fmtBRL, regiao } from '~/utils/protoData'

const { leads, updateLead, setLeadLogo } = useCrm()
const { openNewLead } = useOverlays()

const q = ref('')
const tab = ref('todos')
const UFS = ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS', 'BA', 'PE', 'CE', 'GO', 'DF']

const tabsList = computed(() => [
  { k: 'todos', l: 'Todas', c: leads.value.length },
  { k: 'abertos', l: 'Abertas', c: leads.value.filter((l) => l.stage !== 'perdido').length },
  { k: 'perdidos', l: 'Perdidas', c: leads.value.filter((l) => l.stage === 'perdido').length }
])
const rows = computed(() => {
  let r = leads.value
  if (tab.value !== 'todos') r = r.filter((l) => tab.value === 'abertos' ? l.stage !== 'perdido' : l.stage === 'perdido')
  if (q.value) r = r.filter((l) => (l.company + l.contact.name + l.seg + l.estado).toLowerCase().includes(q.value.toLowerCase()))
  return r
})

const editingId = ref<string | null>(null)
const editing = computed(() => editingId.value ? leads.value.find((l) => l.id === editingId.value) : null)
const form = ref<any>({})
function openEdit(l: any) {
  editingId.value = l.id
  form.value = { company: l.company, site: l.site, seg: l.seg, value: l.value, nome: l.contact.name, cargo: l.contact.role, email: l.contact.email, telefone: l.contact.phone, estado: l.estado }
}
function save() {
  const l = editing.value
  if (!l) return
  updateLead(l.id, {
    company: form.value.company, site: form.value.site, seg: form.value.seg, value: Number(form.value.value) || 0,
    estado: form.value.estado, regiao: regiao(form.value.estado),
    contact: { ...l.contact, name: form.value.nome, role: form.value.cargo, email: form.value.email, phone: form.value.telefone }
  })
  editingId.value = null
}
function removeLogo() { if (editingId.value) setLeadLogo(editingId.value, null) }
function open(id: string) { navigateTo(`/pipeline/${id}`) }
</script>
