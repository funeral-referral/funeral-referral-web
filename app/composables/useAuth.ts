export interface AuthUser {
  id: number
  name: string
  email: string
  role: string
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const { api, token } = useApi()

  async function fetchUser(): Promise<AuthUser | null> {
    if (!token.value) {
      user.value = null

      return null
    }

    try {
      user.value = await api<AuthUser>('/user')
    } catch {
      token.value = null
      user.value = null
    }

    return user.value
  }

  async function login(email: string, password: string): Promise<void> {
    const response = await api<{ token: string; user: AuthUser }>('/login', {
      method: 'POST',
      body: { email, password },
    })

    token.value = response.token
    user.value = response.user
  }

  async function logout(): Promise<void> {
    try {
      await api('/logout', { method: 'POST' })
    } finally {
      token.value = null
      user.value = null
    }
  }

  return { user, fetchUser, login, logout }
}
