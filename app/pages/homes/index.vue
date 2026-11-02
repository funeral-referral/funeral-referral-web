<script setup lang="ts">
import type { Dashboard, Home, Paginated, UserRef } from '~/utils/api-types'

const route = useRoute()
const { api } = useApi()

const search = ref(String(route.query.q ?? ''))
const q = ref(search.value)
const state = ref(String(route.query.state ?? ''))
const homeStatus = ref(String(route.query.status ?? ''))
const ownership = ref(String(route.query.ownership ?? ''))
const stage = ref(String(route.query.stage ?? ''))
const assignedTo = ref(String(route.query.assigned_to ?? ''))
const sort = ref('-partner_score')
const page = ref(1)

let timer: ReturnType<typeof setTimeout> | undefined
watch(search, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    q.value = value
  }, 300)
})
watch([q, state, homeStatus, ownership, stage, assignedTo, sort], () => {
  page.value = 1
})

const params = computed(() => ({
  q: q.value || undefined,
  state: state.value || undefined,
  status: homeStatus.value || undefined,
  ownership_type: ownership.value || undefined,
  stage: stage.value || undefined,
  assigned_to: assignedTo.value || undefined,
  sort: sort.value,
  page: page.value,
  per_page: 25,
}))

const { data: dashboard } = await useAsyncData('dashboard', () => api<Dashboard>('/dashboard'))
const { data: users } = await useAsyncData('assignable-users', () => api<{ data: UserRef[] }>('/users'))
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
        Ownership
        <select v-model="ownership">
          <option value="">Any</option>
          <option value="independent">Independent</option>
          <option value="family_owned">Family-owned</option>
          <option value="chain">Chain</option>
          <option value="unknown">Unknown</option>
        </select>
      </label>
      <label>
        Stage
        <select v-model="stage">
          <option value="">Any</option>
          <option v-for="item in stageOrder" :key="item" :value="item">{{ stageLabel(item) }}</option>
        </select>
      </label>
      <label>
        Assigned to
        <select v-model="assignedTo">
          <option value="">Anyone</option>
          <option value="me">Me</option>
          <option value="unassigned">Unassigned</option>
          <option v-for="user in users?.data ?? []" :key="user.id" :value="String(user.id)">{{ user.name }}</option>
        </select>
      </label>
      <label>
        Sort
        <select v-model="sort">
          <option value="-partner_score">Highest score</option>
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
          <tr>
            <th class="num">Score</th><th>Name</th><th>Stage</th><th>Assigned</th><th>Ownership</th>
            <th>Location</th><th>Phone</th><th>Licence</th><th>First seen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="home in data.data" :key="home.id">
            <td class="num">{{ home.partner_score ?? '—' }}</td>
            <td><NuxtLink :to="`/homes/${home.id}`">{{ home.name }}</NuxtLink></td>
            <td>{{ stageLabel(home.stage) }}</td>
            <td>{{ home.assignee ?? '—' }}</td>
            <td>{{ ownershipLabel(home.ownership_type) }}</td>
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
            <td colspan="9" class="muted">No homes match these filters.</td>
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
