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
      <!-- Tabs + busca -->
      <div class="flex aic gap12" style="padding:14px 16px;border-bottom:1px solid var(--line)">
        <div class="tabs" style="border:0;flex:1">
          <button v-for="t in tabsList" :key="t.k" class="tab" :class="{ active: tab === t.k }" @click="tab = t.k">{{ t.l }}<span class="c">{{ t.c }}</span></button>
        </div>
        <div class="search" style="max-width:280px">
          <Icon name="search" :size="16" /><input v-model="q" placeholder="Buscar empresa, contato ou UF…" style="height:36px" />
        </div>
        <button class="chip" :class="{ active: showFilters }" @click="showFilters = !showFilters"><Icon name="filter" :size="15" /> Filtros<span v-if="activeCount" class="filt-count">{{ activeCount }}</span></button>
      </div>

      <!-- Linha de filtros -->
      <div v-if="showFilters" class="filters-row">
        <div class="filt-block grow">
          <span class="filt-lbl">Ambiente</span>
          <div class="flex aic gap8" style="flex-wrap:wrap">
            <button class="chip chip-sm" :class="{ active: fAmb === '' }" @click="fAmb = ''">Todos</button>
            <button v-for="a in AMBIENTES" :key="a.id" class="chip chip-sm" :class="{ active: fAmb === a.id }" @click="fAmb = fAmb === a.id ? '' : a.id">
              <span class="amb-dot" :style="{ background: a.color }" />{{ a.short }}
            </button>
          </div>
        </div>
        <div class="filt-block">
          <span class="filt-lbl">Estágio</span>
          <select v-model="fStage" class="filt-sel">
            <option value="">Todos</option>
            <option v-for="s in STAGES" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div class="filt-block">
          <span class="filt-lbl">Região</span>
          <select v-model="fRegiao" class="filt-sel">
            <option value="">Todas</option>
            <option v-for="r in REGIOES" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
        <div class="filt-block">
          <span class="filt-lbl">UF</span>
          <select v-model="fUF" class="filt-sel">
            <option value="">Todas</option>
            <option v-for="u in ufsList" :key="u" :value="u">{{ u }}</option>
          </select>
        </div>
        <div class="filt-block">
          <span class="filt-lbl">Ordenar</span>
          <select v-model="sortBy" class="filt-sel">
            <option value="mrr">Maior MRR</option>
            <option value="az">Empresa A–Z</option>
            <option value="recent">Mais recente</option>
          </select>
        </div>
        <button v-if="activeCount" class="btn btn-ghost btn-sm" style="align-self:flex-end;margin-bottom:1px" @click="clearFilters"><Icon name="x" :size="14" /> Limpar</button>
      </div>

      <!-- Tabela densa -->
      <div style="overflow-x:auto">
        <table class="tbl tbl-dense">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Contato principal</th>
              <th>Segmento</th>
              <th>Estágio</th>
              <th class="ta-r">MRR</th>
              <th>Ambiente</th>
              <th>Região</th>
              <th style="width:78px" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in pageRows" :key="l.id" @click="open(l.id)">
              <td>
                <div class="flex aic" style="gap:11px">
                  <CompanyLogo :lead="l" :size="34" :radius="9" />
                  <div class="min0">
                    <div class="cell-strong truncate">{{ l.company }}</div>
                    <div class="cell-mute truncate" style="font-size:12px">{{ l.site }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="flex aic gap8">
                  <EAvatar :name="l.contact.name" :photo="l.contact.photo" :size="30" />
                  <div class="min0">
                    <div class="cell-strong truncate" style="font-weight:500;color:var(--ink)">{{ l.contact.name }}</div>
                    <div class="cell-mute truncate" style="font-size:12px">{{ l.contact.role }}</div>
                  </div>
                </div>
              </td>
              <td><span class="seg-txt">{{ l.seg }}</span></td>
              <td><StageBadge :stage="l.stage" /></td>
              <td class="cell-strong ta-r" style="font-family:var(--font-mono)">{{ fmtBRL(l.value) }}</td>
              <td><AmbienteTag :id="l.ambiente" size="sm" /></td>
              <td><span style="font-size:13px">{{ l.estado }} · <span class="cell-mute">{{ l.regiao }}</span></span></td>
              <td>
                <div class="flex aic gap8" style="justify-content:flex-end">
                  <button class="icon-btn" style="width:32px;height:32px" title="Editar" @click.stop="openEdit(l)"><Icon name="edit" :size="15" /></button>
                  <Icon name="chevron-right" :size="16" style="color:var(--ink-3)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!filtered.length" class="empty" style="padding:48px 16px">Nenhuma empresa encontrada com os filtros atuais.</div>
      </div>

      <!-- Rodapé: contagem + paginação -->
      <div v-if="filtered.length" class="flex aic jcb gap12" style="padding:12px 16px;border-top:1px solid var(--line)">
        <span class="muted" style="font-size:12.5px">
          Mostrando <b class="cell-strong">{{ rangeFrom }}–{{ rangeTo }}</b> de <b class="cell-strong">{{ filtered.length }}</b> empresas
        </span>
        <div v-if="totalPages > 1" class="flex aic gap8">
          <button class="icon-btn" style="width:32px;height:32px" :disabled="page === 1" @click="page--"><Icon name="chevron-right" :size="16" style="transform:rotate(180deg)" /></button>
          <span class="muted" style="font-size:12.5px">Página {{ page }} de {{ totalPages }}</span>
          <button class="icon-btn" style="width:32px;height:32px" :disabled="page === totalPages" @click="page++"><Icon name="chevron-right" :size="16" /></button>
        </div>
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
import { STAGES, AMBIENTES, fmtBRL, regiao } from '~/utils/protoData'

const { leads, updateLead, setLeadLogo } = useCrm()
const { openNewLead } = useOverlays()

const q = ref('')
const tab = ref('todos')
const UFS = ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS', 'BA', 'PE', 'CE', 'GO', 'DF']
const REGIOES = ['Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste', 'Norte']

// filtros
const showFilters = ref(false)
const fAmb = ref('')
const fStage = ref('')
const fRegiao = ref('')
const fUF = ref('')
const sortBy = ref<'mrr' | 'az' | 'recent'>('mrr')
const page = ref(1)
const PER_PAGE = 10

const ufsList = computed(() => Array.from(new Set(leads.value.map((l: any) => l.estado))).sort())

const tabsList = computed(() => [
  { k: 'todos', l: 'Todas', c: leads.value.length },
  { k: 'abertos', l: 'Abertas', c: leads.value.filter((l: any) => l.stage !== 'perdido').length },
  { k: 'perdidos', l: 'Perdidas', c: leads.value.filter((l: any) => l.stage === 'perdido').length }
])

const activeCount = computed(() => [fAmb.value, fStage.value, fRegiao.value, fUF.value].filter(Boolean).length)

const filtered = computed(() => {
  let r = leads.value.slice()
  if (tab.value !== 'todos') r = r.filter((l: any) => tab.value === 'abertos' ? l.stage !== 'perdido' : l.stage === 'perdido')
  if (q.value) {
    const s = q.value.toLowerCase()
    r = r.filter((l: any) => (l.company + l.contact.name + l.seg + l.estado + l.site).toLowerCase().includes(s))
  }
  if (fAmb.value) r = r.filter((l: any) => l.ambiente === fAmb.value)
  if (fStage.value) r = r.filter((l: any) => l.stage === fStage.value)
  if (fRegiao.value) r = r.filter((l: any) => l.regiao === fRegiao.value)
  if (fUF.value) r = r.filter((l: any) => l.estado === fUF.value)
  if (sortBy.value === 'mrr') r.sort((a: any, b: any) => b.value - a.value)
  else if (sortBy.value === 'az') r.sort((a: any, b: any) => a.company.localeCompare(b.company, 'pt-BR'))
  else r.sort((a: any, b: any) => (b.created || '').localeCompare(a.created || ''))
  return r
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))
const pageRows = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))
const rangeFrom = computed(() => filtered.value.length ? (page.value - 1) * PER_PAGE + 1 : 0)
const rangeTo = computed(() => Math.min(page.value * PER_PAGE, filtered.value.length))

// reset página quando filtros/busca/tab mudam
watch([q, tab, fAmb, fStage, fRegiao, fUF, sortBy], () => { page.value = 1 })
watch(totalPages, (n) => { if (page.value > n) page.value = n })

function clearFilters() { fAmb.value = ''; fStage.value = ''; fRegiao.value = ''; fUF.value = '' }

const editingId = ref<string | null>(null)
const editing = computed(() => editingId.value ? leads.value.find((l: any) => l.id === editingId.value) : null)
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

<style scoped>
/* contador no chip de filtros */
.filt-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 17px; height: 17px; padding: 0 5px; margin-left: 4px;
  font-size: 11px; font-weight: 700; line-height: 1;
  color: #fff; background: var(--brand); border-radius: 99px;
}

/* linha de filtros */
.filters-row {
  display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap;
  padding: 14px 16px; border-bottom: 1px solid var(--line);
  background: var(--surface-2);
}
.filt-block { display: flex; flex-direction: column; gap: 6px; }
.filt-lbl {
  font-size: 11px; font-weight: 700; letter-spacing: .03em;
  text-transform: uppercase; color: var(--ink-3);
}
.filt-sel {
  height: 34px; padding: 0 30px 0 11px; min-width: 150px;
  font-family: var(--font); font-size: 13px; font-weight: 500; color: var(--ink);
  background: var(--surface); border: 1px solid var(--line-strong);
  border-radius: var(--r-sm); cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A8F99' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 9px center;
}
.filt-sel:focus { outline: none; border-color: var(--brand); }

.chip-sm { padding: 5px 10px; font-size: 12.5px; }
.amb-dot { width: 8px; height: 8px; border-radius: 99px; display: inline-block; margin-right: 5px; }

/* tabela densa */
.tbl-dense tbody td { padding-top: 9px; padding-bottom: 9px; }
.tbl-dense .seg-txt { font-size: 13px; color: var(--ink-2); }
.ta-r { text-align: right; }
.min0 { min-width: 0; }
.tbl-dense .truncate { max-width: 190px; }
</style>
