// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  devServer: { port: 3000 },
  // tailwind.css must stay after theme.css so utilities can override the shared classes.
  css: ['~/assets/css/theme.css', '~/assets/css/tailwind.css'],
  vite: { plugins: [tailwindcss()] },
  app: {
    head: {
      meta: [{ name: 'color-scheme', content: 'light dark' }],
      // Runs before first paint so a saved dark theme never flashes white.
      script: [
        {
          innerHTML:
            "(function(){try{var m=document.cookie.match(/(?:^|; )theme=([^;]+)/);var c=m?decodeURIComponent(m[1]):'system';var d=c==='dark'||(c!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}})()",
          tagPosition: 'head',
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000',
    },
  },
})
