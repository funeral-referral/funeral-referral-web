export default defineNuxtPlugin(() => {
  const { apply } = useTheme()

  apply()

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', apply)
})
