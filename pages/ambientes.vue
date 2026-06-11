<template>
  <div class="screen content-pad">
    <!-- lista -->
    <template v-if="!sel">
      <div class="page-head">
        <div class="pt"><h1>Ambientes de captação</h1><p class="sub">De onde os leads da eenvo chegam. Abra um ambiente para ver os leads dentro dele.</p></div>
        <div class="acts"><button class="btn btn-primary" @click="openEdit(null)"><Icon name="plus" :size="17" /> Novo ambiente</button></div>
      </div>

      <!-- resumo -->
      <div class="amb-summary">
        <div class="amb-sum">
          <span class="ic" style="background:#8E3FC41A;color:#8E3FC4"><Icon name="globe" :size="16" /></span>
          <div><span class="v">{{ ambientes.length }}</span><span class="l">Ambientes ativos</span></div>
        </div>
        <span class="sep" />
        <div class="amb-sum">
          <span class="ic" style="background:#2563EB1A;color:#2563EB"><Icon name="users" :size="16" /></span>
          <div><span class="v">{{ total }}</span><span class="l">Leads captados</span></div>
        </div>
        <span class="sep" />
        <div class="amb-sum">
          <span class="ic" style="background:#16A34A1A;color:#16A34A"><Icon name="coin" :size="16" /></span>
          <div><span class="v">{{ fmtBRL(mrrTotal) }}</span><span class="l">MRR potencial total</span></div>
        </div>
      </div>

      <!-- toolbar -->
      <div class="card card-pad amb-toolbar">
        <div class="amb-search">
          <Icon name="search" :size="16" />
          <input v-model="q" placeholder="Buscar ambiente por nome ou descrição…" />
          <button v-if="q" class="icon-btn" style="width:26px;height:26px" @click="q = ''"><Icon name="x" :size="14" /></button>
        </div>
        <div class="flex aic gap8">
          <span class="muted" style="font-size:12.5px">Ordenar:</span>
          <div class="segmented">
            <button :class="{ on: sort === 'leads' }" @click="sort = 'leads'">Nº de leads</button>
            <button :class="{ on: sort === 'mrr' }" @click="sort = 'mrr'">MRR</button>
            <button :class="{ on: sort === 'az' }" @click="sort = 'az'">A–Z</button>
          </div>
        </div>
      </div>

      <!-- tabela densa -->
      <div class="card" style="margin-top:16px">
        <div style="overflow-x:auto">
          <table class="tbl amb-tbl">
            <thead>
              <tr>
                <th>Ambiente</th>
                <th style="text-align:right">Leads</th>
                <th style="text-align:right">MRR potencial</th>
                <th style="width:180px">% do total</th>
                <th style="text-align:right">Estados</th>
                <th style="width:44px" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in rows" :key="a.id" @click="sel = a.id">
                <td>
                  <div class="flex aic gap12">
                    <AmbienteLogo :amb="a" :size="36" :radius="10" :icon-size="18" />
                    <div class="min0">
                      <div class="cell-strong truncate">{{ a.name }}</div>
                      <div class="cell-mute truncate" style="font-size:12px">{{ a.desc }}</div>
                    </div>
                  </div>
                </td>
                <td class="cell-strong" style="font-family:var(--font-mono);text-align:right">{{ a._leads }}</td>
                <td class="cell-strong" style="font-family:var(--font-mono);text-align:right">{{ fmtBRL(a._mrr) }}</td>
                <td>
                  <div class="flex aic gap8">
                    <div class="prog" style="flex:1"><i :style="{ width: a._pct + '%', background: a.color }" /></div>
                    <span class="cell-mute" style="font-family:var(--font-mono);font-size:12px;min-width:34px;text-align:right">{{ a._pct }}%</span>
                  </div>
                </td>
                <td class="cell-mute" style="font-family:var(--font-mono);text-align:right">{{ a._ufs }}</td>
                <td>
                  <button class="icon-btn" style="width:30px;height:30px" title="Editar" @click.stop="openEdit(a)"><Icon name="edit" :size="15" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!rows.length" class="empty" style="padding:40px 20px">Nenhum ambiente encontrado para “{{ q }}”.</div>
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
    <div v-if="editing || creating" class="modal-overlay" @mousedown="closeModal">
      <div class="modal" style="width:520px" @mousedown.stop>
        <div class="modal-head">
          <div><h3>{{ creating ? 'Novo ambiente' : 'Editar ambiente' }}</h3><p>Nome, descrição e logo de identificação.</p></div>
          <button class="icon-btn" aria-label="Fechar" @click="closeModal"><Icon name="x" :size="18" /></button>
        </div>
        <div class="modal-body">
          <div v-if="!creating" class="flex aic gap16" style="margin-bottom:18px">
            <AmbienteLogo :amb="editing" :size="64" :radius="16" :icon-size="30" />
            <div>
              <div class="cell-strong" style="font-size:14px">Logo de identificação</div>
              <div class="muted" style="font-size:12.5px;margin-bottom:8px">Clique no logo para enviar uma imagem.</div>
              <button v-if="editing?.logoUrl" class="btn btn-ghost btn-sm" @click="removeLogo"><Icon name="trash" :size="14" /> Remover logo</button>
            </div>
          </div>
          <div class="field"><label>Nome</label><input v-model="form.name" /></div>
          <div class="field"><label>Rótulo curto</label><input v-model="form.short" /></div>
          <div class="field"><label>Descrição</label><input v-model="form.desc" /></div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" @click="closeModal">Cancelar</button>
          <button class="btn btn-primary" @click="save"><Icon name="check" :size="16" /> Salvar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fmtBRL } from '~/utils/protoData'

const { leads, ambientes, ambById, updateAmbiente, createAmbiente, setAmbLogo } = useCrm()

const sel = ref<string | null>(null)
const q = ref('')
const qd = useDebouncedRef(q) // busca com debounce
const sort = ref<'leads' | 'mrr' | 'az'>('leads')

const total = computed(() => leads.value.length)
const leadsDe = (id: string) => leads.value.filter((l) => l.ambiente === id)
const mrrDe = (id: string) => leadsDe(id).filter((l) => l.stage !== 'perdido').reduce((s, l) => s + l.value, 0)
const pct = (id: string) => total.value ? Math.round((leadsDe(id).length / total.value) * 100) : 0
const ufsDe = (id: string) => new Set(leadsDe(id).map((l) => l.estado)).size
const mrrTotal = computed(() => leads.value.filter((l) => l.stage !== 'perdido').reduce((s, l) => s + l.value, 0))

// linhas enriquecidas + filtro + ordenação
const rows = computed(() => {
  const term = qd.value.trim().toLowerCase()
  let list = ambientes.value.map((a: any) => ({
    ...a,
    _leads: leadsDe(a.id).length,
    _mrr: mrrDe(a.id),
    _pct: pct(a.id),
    _ufs: ufsDe(a.id),
  }))
  if (term) list = list.filter((a) => a.name.toLowerCase().includes(term) || (a.desc || '').toLowerCase().includes(term))
  if (sort.value === 'leads') list.sort((a, b) => b._leads - a._leads)
  else if (sort.value === 'mrr') list.sort((a, b) => b._mrr - a._mrr)
  else list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  return list
})

const selAmb = computed(() => sel.value ? ambById(sel.value) : null)
const selLeads = computed(() => sel.value ? leadsDe(sel.value) : [])
const selMrr = computed(() => sel.value ? mrrDe(sel.value) : 0)
const selOpen = computed(() => selLeads.value.filter((l) => l.stage !== 'perdido').length)
const byReg = computed(() => [...new Set(selLeads.value.map((l) => l.regiao))].map((r) => ({ r, n: selLeads.value.filter((l) => l.regiao === r).length })))

const editingId = ref<string | null>(null)
const creating = ref(false)
const editing = computed(() => editingId.value ? ambById(editingId.value) : null)
const form = ref<any>({})
function openEdit(a: any) {
  if (a) { creating.value = false; editingId.value = a.id; form.value = { name: a.name, short: a.short, desc: a.desc } }
  else { creating.value = true; editingId.value = null; form.value = { name: '', short: '', desc: '' } }
}
function closeModal() { editingId.value = null; creating.value = false }
async function save() {
  if (creating.value) {
    if (!form.value.name?.trim()) return
    await createAmbiente({ name: form.value.name, short: form.value.short || form.value.name, desc: form.value.desc })
  } else if (editingId.value) {
    await updateAmbiente(editingId.value, { name: form.value.name, short: form.value.short, desc: form.value.desc })
  }
  closeModal()
}
function removeLogo() { if (editingId.value) setAmbLogo(editingId.value, null) }
function openLead(id: string) { navigateTo(`/pipeline/${id}`) }
</script>

<style scoped>
.amb-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 12px 14px; }
.amb-search { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 240px; max-width: 460px; padding: 8px 12px; border: 1px solid var(--line); border-radius: var(--r-sm); background: var(--surface-2); color: var(--ink-3); }
.amb-search input { flex: 1; border: 0; background: transparent; outline: none; font: inherit; font-size: 13.5px; color: var(--ink); }
.amb-search input::placeholder { color: var(--ink-3); }
.amb-tbl tbody tr { cursor: pointer; }
.min0 { min-width: 0; }

.amb-summary { display: flex; align-items: center; gap: 4px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-card); box-shadow: var(--sh-1); padding: 12px 20px; margin-bottom: 16px; }
.amb-sum { display: flex; align-items: center; gap: 11px; flex: 1; min-width: 0; }
.amb-sum .ic { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 9px; flex: 0 0 34px; }
.amb-sum .v { display: block; font-family: var(--font-mono); font-size: 19px; font-weight: 600; color: var(--ink); line-height: 1.15; }
.amb-sum .l { display: block; font-size: 12px; color: var(--ink-3); }
.amb-summary .sep { width: 1px; align-self: stretch; background: var(--line); margin: 0 8px; }
@media (max-width: 720px) { .amb-summary { flex-wrap: wrap; } .amb-summary .sep { display: none; } }
</style>
