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
      <div class="head">
        <span class="mark" aria-hidden="true" />
        <h1>Funeral Referral</h1>
        <p class="sub">Sign in to continue</p>
      </div>

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
  background:
    radial-gradient(60rem 30rem at 50% -10%, var(--accent-soft), transparent 70%),
    var(--bg);
}
.corner {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
.card {
  width: min(22rem, 100%);
  display: grid;
  gap: 1rem;
  padding: 2rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.head {
  display: grid;
  gap: 0.25rem;
  justify-items: start;
}
.mark {
  width: 1.4rem;
  height: 1.4rem;
  margin-bottom: 0.5rem;
  border-radius: 7px;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
}
h1 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 650;
}
.sub {
  margin: 0;
  color: var(--muted);
}
label {
  display: grid;
  gap: 0.3rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--muted);
}
.btn {
  padding: 0.6rem;
}
.error {
  margin: 0;
  font-size: 0.9rem;
}
</style>
