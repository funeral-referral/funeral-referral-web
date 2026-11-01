<script setup lang="ts">
const { user, logout } = useAuth()

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/homes', label: 'Homes' },
  { to: '/changes', label: 'Changed this week' },
  { to: '/crawl-runs', label: 'Crawl runs' },
]

async function signOut() {
  await logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="shell">
    <header class="bar">
      <div class="left">
        <NuxtLink to="/" class="brand">Funeral Referral</NuxtLink>
        <nav class="nav">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="navlink">
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>
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
.content h1 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
}
.content h2 {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
}
.muted {
  color: #6b7280;
  font-size: 0.875rem;
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.stat {
  padding: 1rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.6rem;
}
.stat .num {
  display: block;
  font-size: 1.7rem;
  font-weight: 600;
}
.panel {
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.6rem;
  overflow-x: auto;
}
.cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(22rem, 1fr));
  gap: 1rem;
}
.tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.tbl th {
  text-align: left;
  font-weight: 600;
  color: #4b5563;
  white-space: nowrap;
}
.tbl th,
.tbl td {
  padding: 0.45rem 0.6rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}
.tbl .num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.tbl a,
.content a {
  color: #1d4ed8;
}
.pill {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: #e5e7eb;
  font-size: 0.78rem;
  white-space: nowrap;
}
.pill.good {
  background: #dcfce7;
  color: #166534;
}
.pill.bad {
  background: #fee2e2;
  color: #991b1b;
}
.pill.warn {
  background: #fef3c7;
  color: #92400e;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: end;
  margin-bottom: 1rem;
}
.filters label {
  display: grid;
  gap: 0.2rem;
  font-size: 0.8rem;
  color: #4b5563;
}
.filters input[type='text'],
.filters select {
  padding: 0.45rem 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 0.4rem;
  font: inherit;
  background: #fff;
}
.filters .check {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  padding-bottom: 0.5rem;
}
.pager {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 0.75rem;
  font-size: 0.9rem;
}
.pager button {
  padding: 0.35rem 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 0.4rem;
  background: #fff;
  font: inherit;
  cursor: pointer;
}
.pager button:disabled {
  opacity: 0.5;
  cursor: default;
}
.error {
  color: #b91c1c;
}
</style>

<style scoped>
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.75rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.brand {
  font-weight: 600;
  color: inherit;
  text-decoration: none;
}
.nav {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.navlink {
  color: #4b5563;
  text-decoration: none;
  font-size: 0.9rem;
}
.navlink.router-link-exact-active {
  color: #111827;
  font-weight: 600;
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
