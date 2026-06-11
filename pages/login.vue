<template>
  <div class="login">
    <div class="login-form">
      <div class="login-card">
        <img class="brand-img" :src="'/brand/eenvo-word-dark.svg'" alt="eenvo" />
        <h1>Entrar no CRM</h1>
        <p class="sub">Acesse o pipeline comercial da eenvo.</p>
        <form @submit.prevent="onSubmit">
          <div class="field"><label>E-mail corporativo</label><input v-model="email" type="email" required /></div>
          <div class="field"><label>Senha</label><input v-model="password" type="password" required /></div>
          <div class="flex aic jcb" style="margin:6px 0 22px">
            <label class="flex aic gap8" style="font-size:13px;color:var(--ink-2);cursor:pointer">
              <span class="act-check done" style="width:18px;height:18px" @click="manter = !manter"><Icon name="check" :size="12" /></span> Manter conectado
            </label>
            <a href="#" style="font-size:13px;color:var(--brand-700);text-decoration:none" @click.prevent="recuperar">Esqueci a senha</a>
          </div>
          <p v-if="erro" style="color:var(--neg);font-size:13px;margin:0 0 12px">{{ erro }}</p>
          <button class="btn btn-primary" type="submit" :disabled="loading" style="width:100%;height:44px">{{ loading ? 'Entrando…' : 'Entrar' }}</button>
        </form>
      </div>
    </div>
    <div class="login-art">
      <img class="login-hero" :src="'/brand/login-art.svg'" alt="" />
      <div class="scrim-top" />
      <img class="word-light" :src="'/brand/eenvo-word-light.svg'" alt="eenvo" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const { login } = useAuth()
const email = ref('eric.luz@fraktalsoftwares.com.br')
const password = ref('Eenvo@2026')
const manter = ref(true)
const loading = ref(false)
const erro = ref('')

async function onSubmit() {
  if (loading.value) return
  loading.value = true
  erro.value = ''
  try {
    await login(email.value, password.value)
    await navigateTo('/')
  } catch (e: any) {
    erro.value = e?.message ?? 'Não foi possível entrar.'
  } finally {
    loading.value = false
  }
}
async function recuperar() {
  if (!email.value) { erro.value = 'Informe o e-mail.'; return }
  await supabase.auth.resetPasswordForEmail(email.value)
  erro.value = 'Enviamos um link de redefinição para o seu e-mail.'
}
</script>
