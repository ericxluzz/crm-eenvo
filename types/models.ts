// Modelos de domínio usados na UI (espelham as tabelas do Supabase).

export interface Profile {
  id: string
  nome: string | null
  papel: 'admin' | 'membro'
  created_at: string
}

export interface Cliente {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  owner_id: string
  created_at: string
  updated_at: string
  // agregados opcionais (via select com count)
  negocios?: { count: number }[]
}

export interface Contato {
  id: string
  cliente_id: string
  nome: string
  cargo: string | null
  email: string | null
  telefone: string | null
  created_at: string
}

export interface Negocio {
  id: string
  cliente_id: string
  titulo: string
  valor: number
  estagio: string
  motivo_perda: string | null
  owner_id: string
  created_at: string
  updated_at: string
  cliente?: Pick<Cliente, 'id' | 'nome'> | null
}

export interface Atividade {
  id: string
  cliente_id: string | null
  negocio_id: string | null
  tipo: 'tarefa' | 'ligacao' | 'email' | 'reuniao'
  titulo: string
  descricao: string | null
  concluida: boolean
  vence_em: string | null
  google_event_id: string | null
  owner_id: string
  created_at: string
  updated_at: string
  cliente?: Pick<Cliente, 'id' | 'nome'> | null
  negocio?: Pick<Negocio, 'id' | 'titulo'> | null
}
