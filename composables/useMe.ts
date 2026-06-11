// Dados do usuário logado (nome/cargo) — lidos do profile no Supabase,
// com fallback para o user_metadata. Substitui o antigo mock `me`.
export function useMe() {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient() as any
  const profile = useState<any>('crm-profile', () => null)

  async function reloadMe() {
    if (!user.value) { profile.value = null; return }
    const { data } = await supabase
      .from('profiles')
      .select('nome, cargo, papel')
      .eq('id', user.value.id)
      .maybeSingle()
    profile.value = data
  }

  watch(user, () => { reloadMe() }, { immediate: true })

  const meta = computed(() => (user.value?.user_metadata || {}) as Record<string, any>)
  const nome = computed(() => profile.value?.nome || meta.value.nome || user.value?.email || 'Usuário')
  const cargo = computed(() => profile.value?.cargo || meta.value.cargo || '')
  const initials = computed(() =>
    (nome.value || 'U').trim().split(/\s+/).slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()
  )

  return { user, profile, nome, cargo, initials, reloadMe }
}
