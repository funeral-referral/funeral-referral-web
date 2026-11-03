export type ThemeChoice = 'system' | 'light' | 'dark'

export function useTheme() {
  const choice = useCookie<ThemeChoice>('theme', {
    default: () => 'system',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  function apply() {
    if (!import.meta.client) {
      return
    }

    const dark = choice.value === 'dark'
      || (choice.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }

  function set(next: ThemeChoice) {
    choice.value = next
    apply()
  }

  return { choice, set, apply }
}
