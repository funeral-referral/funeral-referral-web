<script setup lang="ts">
import type { Dashboard } from '~/utils/api-types'

const { api } = useApi()

const { data, error } = await useAsyncData('dashboard', () => api<Dashboard>('/dashboard'))

const changeTotal = computed(() => data.value?.changes.by_type.reduce((sum, row) => sum + row.total, 0) ?? 0)

function runClass(status: string): string {
  return status === 'completed' ? 'good' : status === 'failed' ? 'bad' : 'warn'
}
</script>

<template>
  <section>
    <h1>Dashboard</h1>

    <p v-if="error" class="error">Could not load the dashboard.</p>

    <template v-else-if="data">
      <div class="stats">
        <div class="stat">
          <span class="num">{{ data.totals.homes }}</span>
          <span class="muted">Funeral homes tracked</span>
        </div>
        <div class="stat">
          <span class="num">{{ data.totals.closed }}</span>
          <span class="muted">Closed or revoked</span>
        </div>
        <div class="stat">
          <span class="num">{{ changeTotal }}</span>
          <span class="muted">Changes in last {{ data.changes.window_days }} days</span>
        </div>
        <div class="stat">
          <span class="num">{{ data.sources.length }}</span>
          <span class="muted">Sources crawled</span>
        </div>
      </div>

      <div class="cols">
        <div class="panel">
          <h2>Coverage by state</h2>
          <table class="tbl">
            <thead>
              <tr><th>State</th><th class="num">Homes</th><th class="num">Closed</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in data.by_state" :key="row.state_code">
                <td><NuxtLink :to="{ path: '/homes', query: { state: row.state_code } }">{{ row.state_code }}</NuxtLink></td>
                <td class="num">{{ row.total }}</td>
                <td class="num">{{ row.closed }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="panel">
          <h2>Changed this week</h2>
          <table v-if="data.changes.by_type.length" class="tbl">
            <tbody>
              <tr v-for="row in data.changes.by_type" :key="row.type">
                <td><NuxtLink :to="{ path: '/changes', query: { type: row.type } }">{{ changeLabel(row.type) }}</NuxtLink></td>
                <td class="num">{{ row.total }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="muted">No changes since the initial load. The next daily crawl runs at 02:00 UTC.</p>
          <p class="muted">
            <NuxtLink to="/changes">See all changes</NuxtLink>
            <template v-if="data.changes.baseline_until"> · the initial load before {{ formatDate(data.changes.baseline_until) }} is hidden</template>
          </p>
        </div>
      </div>

      <div class="panel">
        <h2>Sources</h2>
        <table class="tbl">
          <thead>
            <tr>
              <th>Source</th><th>Type</th><th class="num">Records</th><th>Last run</th>
              <th class="num">Seen</th><th class="num">New</th><th class="num">Changed</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="source in data.sources" :key="source.id">
              <td>{{ source.name }}</td>
              <td>{{ source.type }}</td>
              <td class="num">{{ source.records }}</td>
              <td>
                <template v-if="source.last_run">
                  <span class="pill" :class="runClass(source.last_run.status)">{{ source.last_run.status }}</span>
                  {{ formatDateTime(source.last_run.started_at) }}
                </template>
                <span v-else class="muted">Never</span>
              </td>
              <td class="num">{{ source.last_run?.records_seen ?? '—' }}</td>
              <td class="num">{{ source.last_run?.records_new ?? '—' }}</td>
              <td class="num">{{ source.last_run?.records_changed ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
        <p class="muted"><NuxtLink to="/crawl-runs">All crawl runs</NuxtLink></p>
      </div>
    </template>
  </section>
</template>
