<script setup lang="ts">
const { user, logout } = useAuth()

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/homes', label: 'Homes' },
  { to: '/map', label: 'Map' },
  { to: '/changes', label: 'Changed this week' },
  { to: '/outreach', label: 'Outreach' },
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
      <div class="inner">
        <NuxtLink to="/" class="brand">Funeral Referral</NuxtLink>
        <nav class="nav" aria-label="Main">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="navlink">
            {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="who">
          <ThemeToggle />
          <template v-if="user">
            <span class="email">{{ user.email }}</span>
            <button type="button" class="btn" @click="signOut">Sign out</button>
          </template>
        </div>
      </div>
    </header>
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.bar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}
.inner {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  flex-wrap: wrap;
  max-width: 76rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.brand {
  padding: 0.85rem 0;
  font-family: var(--serif);
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
}
.nav {
  display: flex;
  flex: 1;
  gap: 1.4rem;
  overflow-x: auto;
  align-self: stretch;
}
.navlink {
  display: flex;
  align-items: center;
  border-bottom: 2px solid transparent;
  color: var(--muted);
  font-size: 0.9rem;
  white-space: nowrap;
  text-decoration: none;
}
.navlink:hover {
  color: var(--text);
}
.navlink.router-link-exact-active,
.navlink.router-link-active:not([href='/']) {
  color: var(--text);
  border-bottom-color: var(--accent);
}
.who {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  margin-left: auto;
  font-size: 0.85rem;
}
.email {
  color: var(--muted);
}
.content {
  max-width: 76rem;
  margin: 0 auto;
  padding: 1.75rem 1.5rem 3rem;
}
@media (max-width: 1100px) {
  .nav {
    order: 3;
    flex-basis: 100%;
    gap: 1.2rem;
  }
  .navlink {
    padding: 0.6rem 0;
  }
}
@media (max-width: 640px) {
  .email {
    display: none;
  }
  .inner,
  .content {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
