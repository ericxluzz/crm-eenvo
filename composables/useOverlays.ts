/* Estado global de overlays do CRM: modais (Novo lead / Novo evento) e toasts. */
export function useOverlays() {
  const newLeadOpen = useState('ov-newlead', () => false)
  const newEventOpen = useState('ov-newevent', () => false)
  const toasts = useState<{ id: number; msg: string; icon?: string; type?: string }[]>('ov-toasts', () => [])
  const seq = useState('ov-seq', () => 0)

  function toast(msg: string, opts: { icon?: string; type?: string } = {}) {
    const id = ++seq.value
    toasts.value = [...toasts.value, { id, msg, ...opts }]
    setTimeout(() => { toasts.value = toasts.value.filter((t) => t.id !== id) }, 3200)
  }

  return {
    newLeadOpen,
    newEventOpen,
    toasts,
    toast,
    openNewLead: () => { newLeadOpen.value = true },
    openNewEvent: () => { newEventOpen.value = true }
  }
}
