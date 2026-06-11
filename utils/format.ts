// Formatadores reutilizáveis (pt-BR).

export function formatMoeda(valor: number | string | null | undefined): string {
  const n = typeof valor === 'string' ? Number(valor) : (valor ?? 0)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number.isFinite(n as number) ? (n as number) : 0)
}

export function formatData(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(d)
}

export function formatDataHora(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(d)
}

// Retorna true se a data já passou (atividade atrasada).
export function isAtrasada(value: string | Date | null | undefined): boolean {
  if (!value) return false
  const d = typeof value === 'string' ? new Date(value) : value
  return d.getTime() < Date.now()
}
