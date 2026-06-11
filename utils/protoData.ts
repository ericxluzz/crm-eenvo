/* ============================================================
   eenvo CRM — constantes de UI (estágios, regiões, cores, navegação).
   Os DADOS reais (leads, ambientes, contatos, tarefas, atividades, anexos)
   vêm do Supabase via composables/useCrm.ts. Aqui só fica estrutura/config.
   ============================================================ */

export const STAGES = [
  { id: 'mapeado', name: 'Mapeado', color: '#8A8F99' },
  { id: 'contatado', name: 'Contatado', color: '#2563EB' },
  { id: 'reuniao', name: 'Reunião marcada', color: '#8E3FC4' },
  { id: 'apresentado', name: 'Apresentado', color: '#0891B2' },
  { id: 'proposta', name: 'Proposta enviada', color: '#D97706' },
  { id: 'perdido', name: 'Perdido', color: '#DC2626' }
]

const UF_REGIAO: Record<string, string> = {
  SP: 'Sudeste', RJ: 'Sudeste', MG: 'Sudeste', ES: 'Sudeste',
  PR: 'Sul', SC: 'Sul', RS: 'Sul',
  BA: 'Nordeste', PE: 'Nordeste', CE: 'Nordeste',
  GO: 'Centro-Oeste', DF: 'Centro-Oeste', MT: 'Centro-Oeste'
}
export const regiao = (uf: string) => UF_REGIAO[uf] || '—'

// Paleta cíclica para o logo (cor) de cada lead.
export const LOGO_COLORS = ['#8E3FC4', '#2563EB', '#0891B2', '#16A34A', '#D97706', '#DB2777', '#0EA5E9', '#F97316', '#6366F1', '#0D9488']

// Iniciais a partir de um nome ("Fernanda Reis" -> "FR").
export const initials = (s: string) => (s || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export const NAV = [
  { group: 'Comercial', items: [
    { id: 'dashboard', label: 'Visão geral', icon: 'grid', to: '/' },
    { id: 'pipeline', label: 'Pipeline', icon: 'kanban', to: '/pipeline' },
    { id: 'contacts', label: 'Contatos', icon: 'users', to: '/contatos' },
    { id: 'ambientes', label: 'Ambientes', icon: 'sparkles', to: '/ambientes' },
    { id: 'agenda', label: 'Agenda', icon: 'calendar', to: '/agenda' }
  ] },
  { group: 'Gestão', items: [
    { id: 'reports', label: 'Relatórios', icon: 'chart', to: '/relatorios' },
    { id: 'settings', label: 'Configurações', icon: 'settings', to: '/configuracoes' }
  ] }
]

export const fmtBRL = (n: number) => 'R$ ' + Math.round(n || 0).toLocaleString('pt-BR')
