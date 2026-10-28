function xsrfToken(): string | undefined {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)

  return match?.[1] ? decodeURIComponent(match[1]) : undefined
}

export function useApi() {
  const apiBase = useRuntimeConfig().public.apiBase

  async function csrf(): Promise<void> {
    await $fetch(`${apiBase}/sanctum/csrf-cookie`, { credentials: 'include' })
  }

  function api<T>(path: string, options: Parameters<typeof $fetch>[1] = {}) {
    const token = xsrfToken()

    return $fetch<T>(`${apiBase}/api${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(token ? { 'X-XSRF-TOKEN': token } : {}),
        ...(options.headers as Record<string, string> | undefined),
      },
    })
  }

  return { api, csrf }
}
