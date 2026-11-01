<script setup lang="ts">
import type { Change, Dashboard, Paginated } from '~/utils/api-types'

const route = useRoute()
const { api } = useApi()

const days = ref(7)
const type = ref(String(route.query.type ?? ''))
const state = ref(String(route.query.state ?? ''))
const includeInitial = ref(false)
const page = ref(1)

watch([days, type, state, includeInitial], () => {
  page.value = 1
})

const params = computed(() => ({
  days: days.value,
  type: type.value || undefined,
  state: state.value || undefined,
  include_initial_load: includeInitial.value ? 1 : undefined,
  page: page.value,
  per_page: 50,
}))

const { data: dashboard } = await useAsyncData('dashboard', () => api<Dashboard>('/dashboard'))
const { data, pending, error } = await useAsyncData(
  'changes',
  () => api<Paginated<Change>>('/changes', { query: params.value }),
  { watch: [params] },
)

const states = computed(() => dashboard.value?.by_state.map((row) => row.state_code) ?? [])
const baseline = computed(() => dashboard.value?.changes.baseline_until ?? null)

function typeClass(changeType: string): string {
  return changeType === 'closure' || changeType === 'license_status_changed' ? 'bad' : changeType.startsWith('new_') ? 'good' : ''
}
</script>

<template>
  <section>
    <h1>Changed this week</h1>

    <div class="filters">
      <label>
        Window
        <select v-model.number="days">
          <option :value="7">Last 7 days</option>
          <option :value="14">Last 14 days</option>
          <option :value="30">Last 30 days</option>
          <option :value="90">Last 90 days</option>
        </select>
      </label>
      <label>
        Change
        <select v-model="type">
          <option value="">All changes</option>
          <option v-for="(label, key) in changeTypeLabels" :key="key" :value="key">{{ label }}</option>
        </select>
      </label>
      <label>
        State
        <select v-model="state">
          <option value="">All states</option>
          <option v-for="code in states" :key="code" :value="code">{{ code }}</option>
        </select>
      </label>
      <label class="check">
        <input v-model="includeInitial" type="checkbox" />
        Include initial load
      </label>
    </div>

    <p v-if="error" class="error">Could not load changes.</p>

    <div v-else-if="data" class="panel">
      <p class="muted">{{ data.meta.total }} changes{{ pending ? ' · loading…' : '' }}</p>
      <table class="tbl">
        <thead>
          <tr><th>When</th><th>Change</th><th>Home</th><th>Detail</th><th>Source</th></tr>
        </thead>
        <tbody>
          <tr v-for="change in data.data" :key="change.id">
            <td>{{ formatDateTime(change.occurred_at) }}</td>
            <td><span class="pill" :class="typeClass(change.type)">{{ changeLabel(change.type) }}</span></td>
            <td>
              <NuxtLink v-if="change.home" :to="`/homes/${change.home.id}`">{{ change.home.name }}</NuxtLink>
              <div v-if="change.home" class="muted">{{ [change.home.city, change.home.state_code].filter(Boolean).join(', ') }}</div>
            </td>
            <td>
              <template v-if="change.field">
                {{ fieldLabel(change.field) }}:
                {{ formatValue(change.old_value) }} → {{ formatValue(change.new_value) }}
              </template>
            </td>
            <td>{{ change.source?.name ?? '—' }}</td>
          </tr>
          <tr v-if="!data.data.length">
            <td colspan="5" class="muted">
              No changes in this window.
              <template v-if="baseline && !includeInitial">
                The first crawl (before {{ formatDate(baseline) }}) is hidden; tick “Include initial load” to see it.
              </template>
            </td>
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
