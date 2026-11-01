export function useApi() {
  const apiBase = useRuntimeConfig().public.apiBase
  const token = useCookie<string | null>('auth-token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })

  function api<T>(path: string, options: Parameters<typeof $fetch>[1] = {}) {
    return $fetch<T>(`${apiBase}/api${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        ...(options.headers as Record<string, string> | undefined),
      },
      onResponseError({ response }) {
        if (response.status === 401 && !path.startsWith('/login')) {
          token.value = null

          return navigateTo('/login')
        }
      },
    })
  }

  return { api, token }
}
