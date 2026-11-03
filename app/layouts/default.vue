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
        <NuxtLink to="/" class="brand">
          <span class="mark" aria-hidden="true" />
          Funeral Referral
        </NuxtLink>
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
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in srgb, var(--surface) 82%, transparent);
  border-bottom: 1px solid var(--border);
  backdrop-filter: saturate(160%) blur(12px);
}
.inner {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
  max-width: 76rem;
  margin: 0 auto;
  padding: 0.7rem 1.5rem;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-weight: 650;
  letter-spacing: -0.02em;
  color: var(--text);
  text-decoration: none;
}
.mark {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 4px;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
}
.nav {
  display: flex;
  flex: 1;
  gap: 0.2rem;
  overflow-x: auto;
}
.navlink {
  padding: 0.38rem 0.8rem;
  border-radius: 999px;
  color: var(--muted);
  font-size: 0.88rem;
  font-weight: 500;
  white-space: nowrap;
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
}
.navlink:hover {
  color: var(--text);
  background: var(--surface-2);
}
.navlink.router-link-exact-active,
.navlink.router-link-active:not([href='/']) {
  color: var(--accent);
  background: var(--accent-soft);
}
.who {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-left: auto;
  font-size: 0.85rem;
}
@media (max-width: 1100px) {
  .nav {
    order: 3;
    flex-basis: 100%;
  }
}
.email {
  color: var(--muted);
}
.content {
  max-width: 76rem;
  margin: 0 auto;
  padding: 1.75rem 1.5rem 3rem;
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
