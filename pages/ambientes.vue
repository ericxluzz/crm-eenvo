<template>
  <div class="screen content-pad">
    <!-- lista -->
    <template v-if="!sel">
      <div class="page-head">
        <div class="pt"><h1>Ambientes de captação</h1><p class="sub">De onde os leads da eenvo chegam. Abra um ambiente para ver os leads dentro dele.</p></div>
        <div class="acts"><button class="btn btn-primary"><Icon name="plus" :size="17" /> Novo ambiente</button></div>
      </div>
      <div class="amb-grid">
        <div v-for="a in ambientes" :key="a.id" class="amb-card" @click="sel = a.id">
          <div class="amb-card-top">
            <AmbienteLogo :amb="a" :size="48" :radius="12" :icon-size="24" />
            <div class="grow"><div class="amb-card-nm">{{ a.name }}</div><div class="amb-card-ds">{{ a.desc }}</div></div>
            <button class="icon-btn" style="width:32px;height:32px" title="Editar" @click.stop="openEdit(a)"><Icon name="edit" :size="15" /></button>
          </div>
          <div class="amb-card-stats">
            <div><div class="n" style="font-family:var(--font-mono)">{{ leadsDe(a.id).length }}</div><div class="l">leads</div></div>
            <div><div class="n" style="font-family:var(--font-mono)">{{ fmtBRL(mrrDe(a.id)) }}</div><div class="l">MRR potencial</div></div>
            <div><div class="n" style="font-family:var(--font-mono)">{{ pct(a.id) }}%</div><div class="l">do total</div></div>
          </div>
          <div class="amb-card-foot">
            <div class="prog" style="flex:1"><i :style="{ width: pct(a.id) + '%', background: a.color }" /></div>
            <span class="muted" style="font-size:11.5px;white-space:nowrap">{{ ufsDe(a.id) }} {{ ufsDe(a.id) === 1 ? 'estado' : 'estados' }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- detalhe -->
    <template v-else-if="selAmb">
      <div class="flex aic gap12" style="margin-bottom:18px">
        <button class="btn btn-secondary btn-sm" @click="sel = null"><Icon name="chevron-left" :size="15" /> Ambientes</button>
        <div class="flex aic gap8 muted" style="font-size:13px"><span>Ambientes</span><Icon name="chevron-right" :size="14" /><span style="color:var(--ink);font-weight:500">{{ selAmb.name }}</span></div>
      </div>
      <div class="card card-pad" style="margin-bottom:18px">
        <div class="flex aic gap16" style="flex-wrap:wrap">
          <AmbienteLogo :amb="selAmb" :size="56" :radius="14" :icon-size="28" />
          <div class="grow" style="min-width:200px">
            <h2 style="margin:0;font-size:21px;font-weight:600;letter-spacing:-.02em">{{ selAmb.name }}</h2>
            <p style="margin:4px 0 0;font-size:14px;color:var(--ink-2)">{{ selAmb.desc }}</p>
          </div>
          <div class="flex aic gap8" style="flex-wrap:wrap">
            <button class="btn btn-secondary btn-sm" @click="openEdit(selAmb)"><Icon name="edit" :size="15" /> Editar</button>
            <div class="amb-kpi"><div class="n" style="font-family:var(--font-mono)">{{ selLeads.length }}</div><div class="l">leads</div></div>
            <div class="amb-kpi"><div class="n" style="font-family:var(--font-mono)">{{ selOpen }}</div><div class="l">em aberto</div></div>
            <div class="amb-kpi"><div class="n" style="font-family:var(--font-mono)">{{ fmtBRL(selMrr) }}</div><div class="l">MRR potencial</div></div>
          </div>
        </div>
        <div v-if="byReg.length > 1" class="flex aic gap8" style="margin-top:18px;padding-top:16px;border-top:1px solid var(--line);flex-wrap:wrap">
          <span class="muted" style="font-size:12.5px;margin-right:4px">Por região:</span>
          <span v-for="x in byReg" :key="x.r" class="uf-pill"><Icon name="pin" :size="11" />{{ x.r }} · {{ x.n }}</span>
        </div>
      </div>
      <div class="card">
        <div class="card-pad" style="padding-bottom:6px"><h3 style="margin:0;font-size:16px;font-weight:600">Leads neste ambiente</h3></div>
        <div style="overflow-x:auto">
          <table class="tbl">
            <thead><tr><th>Empresa</th><th>Contato</th><th>Estágio</th><th>Estado · Região</th><th>MRR</th><th>Próxima ação</th><th style="width:40px" /></tr></thead>
            <tbody>
              <tr v-for="l in selLeads" :key="l.id" @click="openLead(l.id)">
                <td><div class="flex aic gap8" style="gap:11px"><CompanyLogo :lead="l" /><div><div class="cell-strong">{{ l.company }}</div><div class="cell-mute" style="font-size:12px">{{ l.seg }}</div></div></div></td>
                <td><div class="flex aic gap8"><EAvatar :name="l.contact.name" :photo="l.contact.photo" :size="28" /><span style="font-size:13px">{{ l.contact.name.split(' ')[0] }}</span></div></td>
                <td><StageBadge :stage="l.stage" /></td>
                <td><span style="font-size:13px">{{ l.estado }} · {{ l.regiao }}</span></td>
                <td class="cell-strong" style="font-family:var(--font-mono)">{{ fmtBRL(l.value) }}</td>
                <td><span class="cell-mute" style="font-size:13px">{{ l.next && l.next.label !== '—' ? l.next.label : '—' }}</span></td>
                <td><Icon name="chevron-right" :size="16" style="color:var(--ink-3)" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Editar ambiente -->
    <div v-if="editing" class="modal-overlay" @mousedown="editingId = null">
      <div class="modal" style="width:520px" @mousedown.stop>
        <div class="modal-head">
          <div><h3>Editar ambiente</h3><p>Nome, descrição e logo de identificação.</p></div>
          <button class="icon-btn" aria-label="Fechar" @click="editingId = null"><Icon name="x" :size="18" /></button>
        </div>
        <div class="modal-body">
          <div class="flex aic gap16" style="margin-bottom:18px">
            <AmbienteLogo :amb="editing" :size="64" :radius="16" :icon-size="30" />
            <div>
              <div class="cell-strong" style="font-size:14px">Logo de identificação</div>
              <div class="muted" style="font-size:12.5px;margin-bottom:8px">Clique no logo para enviar uma imagem.</div>
              <button v-if="editing.logoUrl" class="btn btn-ghost btn-sm" @click="removeLogo"><Icon name="trash" :size="14" /> Remover logo</button>
            </div>
          </div>
          <div class="field"><label>Nome</label><input v-model="form.name" /></div>
          <div class="field"><label>Rótulo curto</label><input v-model="form.short" /></div>
          <div class="field"><label>Descrição</label><input v-model="form.desc" /></div>
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
import { fmtBRL } from '~/utils/protoData'

const { leads, ambientes, ambById, updateAmbiente, setAmbLogo } = useCrm()

const sel = ref<string | null>(null)
const total = computed(() => leads.value.length)
const leadsDe = (id: string) => leads.value.filter((l) => l.ambiente === id)
const mrrDe = (id: string) => leadsDe(id).filter((l) => l.stage !== 'perdido').reduce((s, l) => s + l.value, 0)
const pct = (id: string) => total.value ? Math.round((leadsDe(id).length / total.value) * 100) : 0
const ufsDe = (id: string) => new Set(leadsDe(id).map((l) => l.estado)).size

const selAmb = computed(() => sel.value ? ambById(sel.value) : null)
const selLeads = computed(() => sel.value ? leadsDe(sel.value) : [])
const selMrr = computed(() => sel.value ? mrrDe(sel.value) : 0)
const selOpen = computed(() => selLeads.value.filter((l) => l.stage !== 'perdido').length)
const byReg = computed(() => [...new Set(selLeads.value.map((l) => l.regiao))].map((r) => ({ r, n: selLeads.value.filter((l) => l.regiao === r).length })))

const editingId = ref<string | null>(null)
const editing = computed(() => editingId.value ? ambById(editingId.value) : null)
const form = ref<any>({})
function openEdit(a: any) { editingId.value = a.id; form.value = { name: a.name, short: a.short, desc: a.desc } }
function save() {
  if (!editingId.value) return
  updateAmbiente(editingId.value, { name: form.value.name, short: form.value.short, desc: form.value.desc })
  editingId.value = null
}
function removeLogo() { if (editingId.value) setAmbLogo(editingId.value, null) }
function openLead(id: string) { navigateTo(`/pipeline/${id}`) }
</script>
