// Definição dos 6 estágios do pipeline comercial (Discovery Invo).
// A ordem aqui define a ordem das colunas no Kanban.
export interface Estagio {
  id: string
  label: string
  cor: string // cor do cabeçalho da coluna / tag
  terminal?: 'ganho' | 'perdido'
}

export const ESTAGIOS: Estagio[] = [
  { id: 'novo', label: 'Novo lead', cor: '#64748b' },
  { id: 'em_contato', label: 'Em contato', cor: '#0ea5e9' },
  { id: 'proposta', label: 'Proposta enviada', cor: '#a855f7' },
  { id: 'negociacao', label: 'Negociação', cor: '#7c3aed' },
  { id: 'ganho', label: 'Ganho', cor: '#16a34a', terminal: 'ganho' },
  { id: 'perdido', label: 'Perdido', cor: '#dc2626', terminal: 'perdido' }
]

export const ESTAGIO_LABEL: Record<string, string> = Object.fromEntries(
  ESTAGIOS.map((e) => [e.id, e.label])
)

export const ESTAGIO_COR: Record<string, string> = Object.fromEntries(
  ESTAGIOS.map((e) => [e.id, e.cor])
)

// Motivos de perda (alimentam análise de conversão).
export const MOTIVOS_PERDA = [
  { id: 'preco', label: 'Preço' },
  { id: 'timing', label: 'Timing' },
  { id: 'concorrente', label: 'Concorrente' },
  { id: 'sem_resposta', label: 'Sem resposta' },
  { id: 'outro', label: 'Outro' }
]

// Tipos de atividade.
export const TIPOS_ATIVIDADE = [
  { id: 'tarefa', label: 'Tarefa', icon: 'pi pi-check-square' },
  { id: 'ligacao', label: 'Ligação', icon: 'pi pi-phone' },
  { id: 'email', label: 'E-mail', icon: 'pi pi-envelope' },
  { id: 'reuniao', label: 'Reunião', icon: 'pi pi-video' }
]

export const TIPO_ATIVIDADE_LABEL: Record<string, string> = Object.fromEntries(
  TIPOS_ATIVIDADE.map((t) => [t.id, t.label])
)
