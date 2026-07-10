/* ============================================================
   eenvo CRM — constantes de UI (estágios, regiões, cores, navegação).
   Os DADOS reais (leads, ambientes, contatos, tarefas, atividades, anexos)
   vêm do Supabase via composables/useCrm.ts. Aqui só fica estrutura/config.
   ============================================================ */

export const STAGES = [
  { id: 'nao_contatado', name: 'Não contatado', color: '#94A3B8' },
  { id: 'contatado', name: 'Contatado', color: '#2563EB' },
  { id: 'sem_resposta', name: 'Sem resposta', color: '#F59E0B' },
  { id: 'respondeu', name: 'Respondeu', color: '#0891B2' },
  { id: 'reuniao_marcada', name: 'Reunião marcada', color: '#8E3FC4' },
  { id: 'proposta_enviada', name: 'Proposta enviada', color: '#DB2777' },
  { id: 'pagamento-realizado', name: 'Pagamento realizado', color: '#16A34A' },
  { id: 'perdido', name: 'Perdido', color: '#DC2626' }
]

const UF_REGIAO: Record<string, string> = {
  // Norte
  AC: 'Norte', AP: 'Norte', AM: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
  // Nordeste
  AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste',
  PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
  // Centro-Oeste
  GO: 'Centro-Oeste', MT: 'Centro-Oeste', MS: 'Centro-Oeste', DF: 'Centro-Oeste',
  // Sudeste
  ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste',
  // Sul
  PR: 'Sul', RS: 'Sul', SC: 'Sul'
}
export const regiao = (uf: string) => UF_REGIAO[uf] || '—'

// Todas as 27 UFs do Brasil (ordem alfabética) — fonte única para selects de estado.
export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

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
