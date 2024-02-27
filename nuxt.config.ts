// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxtjs/supabase'],
  supabase: {redirect: true},
  devtools: {
    enabled: true,
  },
  runtimeConfig: {
    public: { 
      baseUrl: process.env.BASE_URL ?? 'http://localhost:3000'
    }
}
})