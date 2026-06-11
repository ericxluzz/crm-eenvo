/**
 * Composable de autenticação — encapsula o cliente Supabase.
 * Use no frontend. Apenas a chave anon é exposta aqui (seguro).
 */
export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function register(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  async function logout() {
    await supabase.auth.signOut()
    await navigateTo('/login')
  }

  return { user, login, register, logout }
}
