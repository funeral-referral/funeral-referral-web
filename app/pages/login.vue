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
    <form class="card" @submit.prevent="submit">
      <h1>Funeral Referral</h1>
      <p class="sub">Sign in to continue</p>

      <label>
        Email
        <input v-model="email" type="email" autocomplete="username" required />
      </label>
      <label>
        Password
        <input v-model="password" type="password" autocomplete="current-password" required />
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <button type="submit" :disabled="busy">{{ busy ? 'Signing in…' : 'Sign in' }}</button>
    </form>
  </div>
</template>

<style scoped>
.wrap {
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  background: #f9fafb;
}
.card {
  width: 22rem;
  display: grid;
  gap: 1rem;
  padding: 2rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
}
h1 {
  margin: 0;
  font-size: 1.4rem;
}
.sub {
  margin: 0;
  color: #6b7280;
}
label {
  display: grid;
  gap: 0.25rem;
  font-size: 0.9rem;
}
input {
  padding: 0.55rem 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 0.4rem;
  font: inherit;
}
button {
  padding: 0.6rem;
  border: 0;
  border-radius: 0.4rem;
  background: #111827;
  color: #fff;
  font: inherit;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
}
.error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.9rem;
}
</style>
