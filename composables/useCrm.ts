/* Store reativo de leads/ambientes do CRM.
   Mantém os dados-semente do protótipo e aplica OVERRIDES editáveis
   (edição de campos + logo), persistidos em localStorage. */
import { LEADS as SEED_LEADS, AMBIENTES as SEED_AMB } from '~/utils/protoData'

const LKEY = 'eenvo-lead-ov'
const AKEY = 'eenvo-amb-ov'

export function useCrm() {
  const leadOv = useState<Record<string, any>>('crm-lead-ov', () => ({}))
  const ambOv = useState<Record<string, any>>('crm-amb-ov', () => ({}))

  const leads = computed(() => SEED_LEADS.map((l) => ({ ...l, ...leadOv.value[l.id] })))
  const ambientes = computed(() => SEED_AMB.map((a) => ({ ...a, ...ambOv.value[a.id] })))

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(LKEY, JSON.stringify(leadOv.value))
      localStorage.setItem(AKEY, JSON.stringify(ambOv.value))
    } catch { /* quota / indisponível */ }
  }

  function updateLead(id: string, patch: Record<string, any>) {
    leadOv.value = { ...leadOv.value, [id]: { ...leadOv.value[id], ...patch } }
    persist()
  }
  function updateAmbiente(id: string, patch: Record<string, any>) {
    ambOv.value = { ...ambOv.value, [id]: { ...ambOv.value[id], ...patch } }
    persist()
  }
  const setLeadLogo = (id: string, url: string | null) => updateLead(id, { logoUrl: url })
  const setAmbLogo = (id: string, url: string | null) => updateAmbiente(id, { logoUrl: url })

  // ---- Mutações de arrays dentro de um lead (contatos, tarefas, atividades, anexos) ----
  // `arr` é o array atual exibido (já reflete seed + override); cada item tem `id`.
  // Persistem como qualquer campo do override (updateLead → localStorage).
  function addLeadItem(id: string, field: string, item: any, arr: any[]) {
    updateLead(id, { [field]: [...arr, item] })
  }
  function updateLeadItem(id: string, field: string, itemId: string, patch: Record<string, any>, arr: any[]) {
    updateLead(id, { [field]: arr.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) })
  }
  function removeLeadItem(id: string, field: string, itemId: string, arr: any[]) {
    updateLead(id, { [field]: arr.filter((it) => it.id !== itemId) })
  }
  // Mantém a "próxima tarefa" do card do Pipeline em sincronia com a lista de tarefas.
  const setLeadNext = (id: string, task: any | null) => updateLead(id, { next: task })

  function ambById(id: string) { return ambientes.value.find((a) => a.id === id) }

  return {
    leads, ambientes, leadOv, ambOv,
    updateLead, updateAmbiente, setLeadLogo, setAmbLogo, ambById,
    addLeadItem, updateLeadItem, removeLeadItem, setLeadNext
  }
}

export function hydrateCrm() {
  const { leadOv, ambOv } = useCrm()
  try { const l = localStorage.getItem(LKEY); if (l) leadOv.value = JSON.parse(l) } catch { /* noop */ }
  try { const a = localStorage.getItem(AKEY); if (a) ambOv.value = JSON.parse(a) } catch { /* noop */ }
}
