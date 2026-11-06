<script setup lang="ts">
definePageMeta({ layout: false })

const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function submit() {
  busy.value = true
  error.value = ''

  try {
    await login(email.value, password.value)
    await navigateTo('/')
  } catch (e) {
    const data = (e as { data?: { errors?: { email?: string[] }; message?: string } }).data
    error.value = data?.errors?.email?.[0] ?? data?.message ?? 'Unable to sign in.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="wrap">
    <div class="corner"><ThemeToggle /></div>
    <form class="card" @submit.prevent="submit">
      <h1>Funeral Referral</h1>
      <p class="sub">Sign in to continue.</p>

      <label>
        Email
        <input v-model="email" type="email" autocomplete="username" required />
      </label>
      <label>
        Password
        <input v-model="password" type="password" autocomplete="current-password" required />
      </label>

      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <button type="submit" class="btn primary" :disabled="busy">{{ busy ? 'Signing in…' : 'Sign in' }}</button>
    </form>
  </div>
</template>

<style scoped>
.wrap {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: var(--bg);
}
.corner {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
.card {
  width: min(21rem, 100%);
  display: grid;
  gap: 0.9rem;
  padding: 1.75rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
h1 {
  margin: 0;
  font-family: var(--serif);
  font-size: 1.6rem;
  font-weight: 600;
}
.sub {
  margin: -0.5rem 0 0.25rem;
  color: var(--muted);
}
label {
  display: grid;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--muted);
}
input {
  width: 100%;
}
.btn {
  padding: 0.55rem;
}
.error {
  margin: 0;
  font-size: 0.9rem;
}
</style>
