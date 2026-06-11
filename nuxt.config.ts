// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: [
    '@primevue/nuxt-module',
    '@nuxtjs/supabase'
  ],

  // Estilos globais: design system do protótipo de alta fidelidade (eenvo).
  // Ordem importa: tokens → base/atoms → telas.
  css: [
    'primeicons/primeicons.css',
    '~/assets/css/proto-tokens.css',
    '~/assets/css/proto-styles.css',
    '~/assets/css/proto-screens.css'
  ],

  // ---------------------------------------------------------------------------
  // PrimeVue — tema da marca eenvo (roxo, white mode)
  // ---------------------------------------------------------------------------
  primevue: {
    autoImport: true,
    // `importTheme` precisa ficar na RAIZ de `primevue` — o @primevue/nuxt-module v4
    // só registra o tema quando lê esta opção aqui (dentro de `options` ela é ignorada
    // e os componentes renderizam sem estilo).
    importTheme: { from: '~/themes/eenvo-preset.ts' },
    options: {
      ripple: true
    }
  },

  // ---------------------------------------------------------------------------
  // Supabase — auth, banco e storage
  // As chaves vêm de variáveis de ambiente (.env). NUNCA commitar segredos.
  // SUPABASE_SERVICE_ROLE_KEY só é usada no servidor (server/).
  // ---------------------------------------------------------------------------
  supabase: {
    // Redireciona usuários não autenticados para /login
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      // Rotas públicas (não exigem login)
      exclude: ['/login', '/registro', '/recuperar-senha']
    }
  },

  // ---------------------------------------------------------------------------
  // Variáveis de servidor (não expostas ao cliente).
  // Integração Google Agenda (OAuth) — usadas só em server/api/google/*.
  // ---------------------------------------------------------------------------
  runtimeConfig: {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI
  },

  app: {
    head: {
      title: 'CRM eenvo',
      htmlAttrs: { lang: 'pt-BR' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'CRM eenvo — gestão de clientes e negócios.' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap'
        }
      ]
    }
  },

  typescript: {
    strict: true
  }
})
