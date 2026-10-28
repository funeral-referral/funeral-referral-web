export interface AuthUser {
  id: number
  name: string
  email: string
  role: string
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const { api, csrf } = useApi()

  async function fetchUser(): Promise<AuthUser | null> {
    try {
      user.value = await api<AuthUser>('/user')
    } catch {
      user.value = null
    }

    return user.value
  }

  async function login(email: string, password: string): Promise<void> {
    await csrf()
    user.value = await api<AuthUser>('/login', {
      method: 'POST',
      body: { email, password },
    })
  }

  async function logout(): Promise<void> {
    await api('/logout', { method: 'POST' })
    user.value = null
  }

  return { user, fetchUser, login, logout }
}
