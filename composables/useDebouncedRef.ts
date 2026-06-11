// Retorna um ref que "segue" a fonte com atraso (debounce).
// Uso: o <input> fica ligado a `q` (digitação instantânea), mas o computed de
// filtragem lê o ref debounced — então a lista/Kanban só recomputa e re-renderiza
// depois que o usuário para de digitar. Crítico ao escalar (1000+ itens filtrando
// client-side a cada tecla). Ref.: Manual de Performance, seção 3 (buscas com debounce).
export function useDebouncedRef<T>(source: Ref<T>, delay = 200): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined
  watch(source, (v) => {
    clearTimeout(timer)
    timer = setTimeout(() => { debounced.value = v }, delay)
  })
  onScopeDispose(() => clearTimeout(timer))
  return debounced
}
