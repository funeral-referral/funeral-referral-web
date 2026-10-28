<script setup lang="ts">
const { user, logout } = useAuth()

async function signOut() {
  await logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="shell">
    <header class="bar">
      <NuxtLink to="/" class="brand">Funeral Referral</NuxtLink>
      <div v-if="user" class="who">
        <span>{{ user.email }}</span>
        <button type="button" @click="signOut">Sign out</button>
      </div>
    </header>
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  color: #1f2937;
  background: #f9fafb;
}
</style>

<style scoped>
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.brand {
  font-weight: 600;
  color: inherit;
  text-decoration: none;
}
.who {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.9rem;
}
.content {
  max-width: 72rem;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
