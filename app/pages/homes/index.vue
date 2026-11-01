<script setup lang="ts">
import type { Dashboard, Home, Paginated } from '~/utils/api-types'

const route = useRoute()
const { api } = useApi()

const search = ref(String(route.query.q ?? ''))
const q = ref(search.value)
const state = ref(String(route.query.state ?? ''))
const homeStatus = ref(String(route.query.status ?? ''))
const sort = ref('name')
const page = ref(1)

let timer: ReturnType<typeof setTimeout> | undefined
watch(search, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    q.value = value
  }, 300)
})
watch([q, state, homeStatus, sort], () => {
  page.value = 1
})

const params = computed(() => ({
  q: q.value || undefined,
  state: state.value || undefined,
  status: homeStatus.value || undefined,
  sort: sort.value,
  page: page.value,
  per_page: 25,
}))

const { data: dashboard } = await useAsyncData('dashboard', () => api<Dashboard>('/dashboard'))
const { data, pending, error } = await useAsyncData(
  'homes',
  () => api<Paginated<Home>>('/homes', { query: params.value }),
  { watch: [params] },
)

const states = computed(() => dashboard.value?.by_state.map((row) => row.state_code) ?? [])
</script>

<template>
  <section>
    <h1>Homes</h1>

    <div class="filters">
      <label>
        Search
        <input v-model="search" type="text" placeholder="Name, city, phone, licence" />
      </label>
      <label>
        State
        <select v-model="state">
          <option value="">All states</option>
          <option v-for="code in states" :key="code" :value="code">{{ code }}</option>
        </select>
      </label>
      <label>
        Status
        <select v-model="homeStatus">
          <option value="">Any</option>
          <option value="open">Open</option>
          <option value="closed">Closed or revoked</option>
        </select>
      </label>
      <label>
        Sort
        <select v-model="sort">
          <option value="name">Name</option>
          <option value="state_code">State</option>
          <option value="-first_seen_at">Newest first</option>
        </select>
      </label>
    </div>

    <p v-if="error" class="error">Could not load homes.</p>

    <div v-else-if="data" class="panel">
      <p class="muted">{{ data.meta.total }} homes{{ pending ? ' · loading…' : '' }}</p>
      <table class="tbl">
        <thead>
          <tr><th>Name</th><th>Location</th><th>Phone</th><th>Licence</th><th>First seen</th></tr>
        </thead>
        <tbody>
          <tr v-for="home in data.data" :key="home.id">
            <td><NuxtLink :to="`/homes/${home.id}`">{{ home.name }}</NuxtLink></td>
            <td>{{ [home.city, home.state_code].filter(Boolean).join(', ') }}</td>
            <td>{{ formatValue(home.phone) }}</td>
            <td>
              {{ home.license_number ?? '—' }}
              <span
                v-if="home.license_status"
                class="pill"
                :class="home.closed_at ? 'bad' : 'good'"
              >{{ home.license_status }}</span>
            </td>
            <td>{{ formatDate(home.first_seen_at) }}</td>
          </tr>
          <tr v-if="!data.data.length">
            <td colspan="5" class="muted">No homes match these filters.</td>
          </tr>
        </tbody>
      </table>

      <div class="pager">
        <button type="button" :disabled="page <= 1" @click="page--">Previous</button>
        <span>Page {{ data.meta.current_page }} of {{ data.meta.last_page }}</span>
        <button type="button" :disabled="page >= data.meta.last_page" @click="page++">Next</button>
      </div>
    </div>
  </section>
</template>
