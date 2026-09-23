// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/supabase'],

  // Reads SUPABASE_URL and SUPABASE_KEY from .env.
  supabase: {
    // Most pages are public, so no global "log in first" redirect.
    // Pages that need a user send people to /login themselves.
    redirect: false,
    // Table types for the Supabase client live in app/types/database.types.ts (the default path).
  },

  css: ['~/assets/main.css'],

  app: {
    head: {
      title: 'COLOR',
      meta: [{ name: 'description', content: 'Make colour palettes, share them, like other people\'s.' }],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Archivo with its width axis: wide for signage, condensed for chip labels.
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&display=swap' },
      ],
    },
  },
})
