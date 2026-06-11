// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/supabase'
  ],

  // Estilos globais: design system do protótipo de alta fidelidade (eenvo).
  // Ordem importa: tokens → base/atoms → telas. (Fontes via Google Fonts no head.)
  css: [
    '~/assets/css/proto-tokens.css',
    '~/assets/css/proto-styles.css',
    '~/assets/css/proto-screens.css'
  ],

  // Login é público e estático → pré-renderizado (carrega do CDN, sem cold start).
  routeRules: {
    '/login': { prerender: true }
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
